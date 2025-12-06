package com.roomie.services.property_service.service;

import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.*;
import com.roomie.services.property_service.entity.Owner;
import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.entity.PropertyDocument;
import com.roomie.services.property_service.enums.ApprovalStatus;
import com.roomie.services.property_service.enums.PropertyStatus;
import com.roomie.services.property_service.mapper.PropertyMapper;
import com.roomie.services.property_service.repository.PropertyRepository;
import com.roomie.services.property_service.repository.PropertySearchRepository;
import com.roomie.services.property_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyService {
    PropertyRepository propertyRepository;
    PropertySearchRepository searchRepository;
    PropertyMapper mapper;
    ProfileClient propertyClient;

    @CacheEvict(value = "properties", allEntries = true)
    public PropertyResponse create(PropertyRequest request) {
        Property entity = mapper.toEntity(request);
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileResponse userResponse = propertyClient.getProfile(userId).getResult();
        Owner owner = Owner.builder()
                .ownerId(userId)
                .name(userResponse.getLastName()+" "+userResponse.getFirstName())
                .email(userResponse.getEmail())
                .phoneNumber(userResponse.getPhoneNumber())
                .build();
        entity.setOwner(owner);
        entity.setStatus(ApprovalStatus.DRAFT);
        entity.setPropertyStatus(PropertyStatus.INACTIVE);
        Instant now = Instant.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        Property saved = propertyRepository.save(entity);

        // Index ES
        PropertyDocument doc = mapper.toDocument(saved);
        doc.setPropertyId(saved.getPropertyId());
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
        doc.setPropertyId(saved.getPropertyId());
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
    public List<PropertyResponse> findByStatus(ApprovalStatus status) {
        return propertyRepository.findByStatus(status)
                .stream().map(mapper::toResponse)
                .collect(Collectors.toList());
    }
    public List<PropertyResponse> findByPriceRange(BigDecimal min, BigDecimal max) {
        return propertyRepository.findByMonthlyRentBetween(min, max).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    public List<PropertyResponse> findByProvince(String province) {
        return propertyRepository.findByAddress_ProvinceIgnoreCase(province).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    public List<PropertyResponse> getMyProperties() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Property> properties = propertyRepository.findAllByOwner_OwnerId(userId);

        return properties.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }


    public List<PropertyResponse> searchFullText(String q) {
        List<PropertyDocument> docs = searchRepository.findByTitleContainingOrDescriptionContaining(q, q);
        return docs.stream()
                .map(d -> {
                    // convert ES doc -> minimal response
                    PropertyResponse resp = PropertyResponse.builder()
                            .propertyId(d.getPropertyId())
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
            doc.setPropertyId(p.getPropertyId());
            doc.setCreatedAt(p.getCreatedAt());
            doc.setUpdatedAt(p.getUpdatedAt());
            searchRepository.save(doc);
        });
    }

    //Gửi đến admin duyệt
    public PropertyResponse publish(String id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));

        if (property.getStatus() != ApprovalStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only DRAFT properties can be published. Current: "
                            + property.getStatus()
            );
        }
        property.setStatus(ApprovalStatus.PENDING);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        // Thông báo admin
//        notificationClient.send(
//                new NotificationRequest("Admin", "New property awaiting review", property.getTitle()));

        return mapper.toResponse(property);
    }


    public PropertyResponse approve(String id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));

        if (property.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING properties can be approved. Current: "
                            + property.getStatus()
            );
        }
        property.setStatus(ApprovalStatus.ACTIVE);
        property.setPropertyStatus(PropertyStatus.AVAILABLE);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        // Index lại ES
        PropertyDocument doc = mapper.toDocument(property);
        doc.setPropertyId(property.getPropertyId());
        searchRepository.save(doc);

        // Notify landlord
//        notificationClient.send(new NotificationRequest(
//                property.getOwner().getEmail(),
//                "Your property has been approved!",
//                property.getTitle()
//        ));
//
//        // Track analytics
//        analyticsClient.track(new AnalyticsEventRequest(
//                "PROPERTY_APPROVED",
//                property.getPropertyId(),
//                property.getOwner().getOwnerId()
//        ));

        return mapper.toResponse(property);
    }

    public PropertyResponse reject(String id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
        if (property.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING properties can be rejected. Current: "
                            + property.getStatus()
            );
        }
        property.setStatus(ApprovalStatus.REJECTED);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        // Index lại ES
        PropertyDocument doc = mapper.toDocument(property);
        doc.setPropertyId(property.getPropertyId());
        searchRepository.save(doc);

        // Notify landlord
//        notificationClient.send(new NotificationRequest(
//                property.getOwner().getEmail(),
//                "Your property has been approved!",
//                property.getTitle()
//        ));
//
//        // Track analytics
//        analyticsClient.track(new AnalyticsEventRequest(
//                "PROPERTY_APPROVED",
//                property.getPropertyId(),
//                property.getOwner().getOwnerId()
//        ));

        return mapper.toResponse(property);
    }
    public void markAsRented(String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));

        // Validation
        if (property.getStatus() != ApprovalStatus.ACTIVE) {
            throw new IllegalStateException("Property must be ACTIVE to rent");
        }

        if (property.getPropertyStatus() != PropertyStatus.AVAILABLE) {
            throw new IllegalStateException(
                    "Property must be AVAILABLE to rent. Current: "
                            + property.getPropertyStatus()
            );
        }

        property.setPropertyStatus(PropertyStatus.RENTED);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        // Remove from search results
        searchRepository.deleteById(propertyId);
    }

    public void markAsAvailable(String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));

        if (property.getPropertyStatus() != PropertyStatus.RENTED) {
            throw new IllegalStateException(
                    "Only RENTED properties can be marked as AVAILABLE. Current: "
                            + property.getPropertyStatus()
            );
        }

        property.setPropertyStatus(PropertyStatus.AVAILABLE);
        property.setUpdatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        // Re-index to search
        if (property.getStatus() == ApprovalStatus.ACTIVE) {
            PropertyDocument doc = mapper.toDocument(saved);
            searchRepository.save(doc);
        }
    }
    public void deactivate(String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));

        property.setPropertyStatus(PropertyStatus.INACTIVE);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        // Remove from search
        searchRepository.deleteById(propertyId);
    }
    public List<PropertyResponse> getAllPublicProperties() {
        return propertyRepository
                .findByStatusAndPropertyStatus(
                        ApprovalStatus.ACTIVE,
                        PropertyStatus.AVAILABLE
                )
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
//        return null;
    }
    public ApiResponse<List<PropertyResponse>> getPropertiesByOwner(String ownerId) {
        List<Property> properties = propertyRepository.findByOwner_OwnerId(ownerId);

        List<PropertyResponse> response = properties.stream()
                .map(mapper::toResponse)
                .toList();

        return ApiResponse.<List<PropertyResponse>>builder()
                .code(1000)
                .success(true)
                .result(response)
                .build();
    }

}
