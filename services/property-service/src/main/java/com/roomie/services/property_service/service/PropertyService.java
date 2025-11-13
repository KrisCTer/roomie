package com.roomie.services.property_service.service;

import com.roomie.services.property_service.configuration.AuthUtil;
import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.PropertyResponse;
import com.roomie.services.property_service.entity.Owner;
import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.entity.PropertyDocument;
import com.roomie.services.property_service.mapper.PropertyMapper;
import com.roomie.services.property_service.repository.PropertyRepository;
import com.roomie.services.property_service.repository.PropertySearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyService {
    PropertyRepository propertyRepository;
    PropertySearchRepository searchRepository;
    PropertyMapper mapper;

    // Cache name "property"
    @CacheEvict(value = "properties", allEntries = true)
    public PropertyResponse create(PropertyRequest request) {
        Property entity = mapper.toEntity(request);

        // Gán Owner tự động từ người đang đăng nhập
        Owner currentOwner = AuthUtil.getCurrentOwner();
        entity.setOwner(currentOwner);

        Instant now = Instant.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        Property saved = propertyRepository.save(entity);

        // Index ES
        PropertyDocument doc = mapper.toDocument(saved);
        doc.setId(saved.getPropertyId());
        doc.setCreatedAt(saved.getCreatedAt());
        doc.setUpdatedAt(saved.getUpdatedAt());
        searchRepository.save(doc);

        return mapper.toResponse(saved);
    }
    @CacheEvict(value = "properties", key = "#id")
    public PropertyResponse update(String id, PropertyRequest request) {
        Property existing = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
        // map fields (simple)
        Property updated = mapper.toEntity(request);
        updated.setPropertyId(existing.getPropertyId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        Property saved = propertyRepository.save(updated);

        // update ES
        PropertyDocument doc = mapper.toDocument(saved);
        doc.setId(saved.getPropertyId());
        doc.setCreatedAt(saved.getCreatedAt());
        doc.setUpdatedAt(saved.getUpdatedAt());
        searchRepository.save(doc);

        return mapper.toResponse(saved);
    }
    @CacheEvict(value = "properties", key = "#id")
    public void delete(String id) {
        propertyRepository.deleteById(id);
        searchRepository.deleteById(id);
    }

    @Cacheable(value = "properties", key = "#id")
    public PropertyResponse getById(String id) {
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
        return mapper.toResponse(p);
    }

    public List<PropertyResponse> findAll(int page, int size) {
        return propertyRepository.findAll(PageRequest.of(page, size)).stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    public List<PropertyResponse> findByPriceRange(BigDecimal min, BigDecimal max) {
        return propertyRepository.findByPriceBetween(min, max).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    public List<PropertyResponse> findByProvince(String province) {
        return propertyRepository.findByAddress_ProvinceIgnoreCase(province).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    public List<PropertyResponse> searchFullText(String q) {
        List<PropertyDocument> docs = searchRepository.findByTitleContainingOrDescriptionContaining(q, q);
        return docs.stream()
                .map(d -> {
                    // convert ES doc -> minimal response
                    PropertyResponse resp = PropertyResponse.builder()
                            .id(d.getId())
                            .title(d.getTitle())
                            .description(d.getDescription())
                            .createdAt(d.getCreatedAt())
                            .updatedAt(d.getUpdatedAt())
                            .build();
                    return resp;
                }).collect(Collectors.toList());
    }

    public void reindexAll() {
        searchRepository.deleteAll();
        propertyRepository.findAll().forEach(p -> {
            PropertyDocument doc = mapper.toDocument(p);
            doc.setId(p.getPropertyId());
            doc.setCreatedAt(p.getCreatedAt());
            doc.setUpdatedAt(p.getUpdatedAt());
            searchRepository.save(doc);
        });
    }
}
