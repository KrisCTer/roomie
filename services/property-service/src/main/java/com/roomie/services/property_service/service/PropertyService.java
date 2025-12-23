package com.roomie.services.property_service.service;

import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.*;
import com.roomie.services.property_service.entity.Owner;
import com.roomie.services.property_service.entity.Property;
import com.roomie.services.property_service.entity.PropertyDocument;
import com.roomie.services.property_service.enums.ApprovalStatus;
import com.roomie.services.property_service.enums.PropertyLabel;
import com.roomie.services.property_service.enums.PropertyStatus;
import com.roomie.services.property_service.exception.AppException;
import com.roomie.services.property_service.exception.ErrorCode;
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
    ProfileClient profileClient;

    // ============================================================
    // CREATE PROPERTY
    // ============================================================
    @CacheEvict(value = "properties", allEntries = true)
    public PropertyResponse create(PropertyRequest request) {

        Property entity = mapper.toEntity(request);
        String userId = getCurrentUserId();

        Owner owner = fetchOwnerProfile(userId);

        entity.setOwner(owner);
        entity.setStatus(ApprovalStatus.DRAFT);
        entity.setPropertyStatus(PropertyStatus.INACTIVE);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        Property saved = propertyRepository.save(entity);

        index(saved);

        return mapper.toResponse(saved);
    }

    // ============================================================
    // UPDATE PROPERTY (PATCH STYLE)
    // ============================================================
    @CacheEvict(value = "properties", key = "#id")
    public PropertyResponse update(String id, PropertyRequest request) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        updatePropertyFields(property, request);
        property.setUpdatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        index(saved);

        return mapper.toResponse(saved);
    }

    private void updatePropertyFields(Property p, PropertyRequest r) {
        if (r.getTitle() != null) p.setTitle(r.getTitle());
        if (r.getDescription() != null) p.setDescription(r.getDescription());
        if (r.getMonthlyRent() != null) p.setMonthlyRent(r.getMonthlyRent());
        if (r.getRentalDeposit() != null) p.setRentalDeposit(r.getRentalDeposit());
        if (r.getPropertyType() != null) p.setPropertyType(r.getPropertyType());
        if (r.getPropertyLabel() != null) p.setPropertyLabel(r.getPropertyLabel());
        if (r.getSize() != null) p.setSize(r.getSize());
        if (r.getRooms() != null) p.setRooms(r.getRooms());
        if (r.getBedrooms() != null) p.setBedrooms(r.getBedrooms());
        if (r.getBathrooms() != null) p.setBathrooms(r.getBathrooms());
        if (r.getGarages() != null) p.setGarages(r.getGarages());
    }

    // ============================================================
    // DELETE PROPERTY
    // ============================================================
    @CacheEvict(value = "properties", key = "#id")
    public void delete(String id) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        propertyRepository.deleteById(id);
        searchRepository.deleteById(id);
    }

    // ============================================================
    // BASIC GETTERS
    // ============================================================
//    @Cacheable(value = "properties", key = "#id")
    public PropertyResponse getById(String id) {

        Property property = findPropertyOrThrow(id);
        return mapper.toResponse(property);
    }

    public List<PropertyResponse> findAll(int page, int size) {
        return propertyRepository.findAll(PageRequest.of(page, size))
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> findByStatus(ApprovalStatus status) {
        return propertyRepository.findByStatus(status)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> findByPriceRange(BigDecimal min, BigDecimal max) {
        return propertyRepository.findByMonthlyRentBetween(min, max)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> findByProvince(String province) {
        return propertyRepository.findByAddress_ProvinceIgnoreCase(province)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> getMyProperties() {

        String userId = getCurrentUserId();

        return propertyRepository.findAllByOwner_OwnerId(userId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // SEARCH FULLTEXT
    // ============================================================
    public List<PropertyResponse> searchFullText(String q) {

        List<PropertyDocument> docs =
                searchRepository.findByTitleContainingOrDescriptionContaining(q, q);

        return docs.stream()
                .map(d -> PropertyResponse.builder()
                        .propertyId(d.getPropertyId())
                        .title(d.getTitle())
                        .description(d.getDescription())
                        .createdAt(d.getCreatedAt())
                        .updatedAt(d.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ============================================================
    // INDEXING
    // ============================================================
    public void reindexAll() {

        searchRepository.deleteAll();

        propertyRepository.findAll().forEach(this::index);
    }

    private void index(Property p) {
        try {
            PropertyDocument doc = mapper.toDocument(p);
            doc.setPropertyId(p.getPropertyId());
            doc.setCreatedAt(p.getCreatedAt());
            doc.setUpdatedAt(p.getUpdatedAt());
            searchRepository.save(doc);
        } catch (Exception e) {
            log.error("Failed to index property {}: {}", p.getPropertyId(), e.getMessage());
        }
    }

    // ============================================================
    // PUBLISH / APPROVE / REJECT
    // ============================================================
    public PropertyResponse publish(String id) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        if (property.getStatus() != ApprovalStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setStatus(ApprovalStatus.PENDING);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        return mapper.toResponse(property);
    }

    public PropertyResponse approve(String id) {

        Property property = findPropertyOrThrow(id);

        if (property.getStatus() != ApprovalStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setStatus(ApprovalStatus.ACTIVE);
        property.setPropertyStatus(PropertyStatus.AVAILABLE);
        property.setPropertyLabel(PropertyLabel.NEW);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        index(property);

        return mapper.toResponse(property);
    }

    public PropertyResponse reject(String id) {

        Property property = findPropertyOrThrow(id);

        if (property.getStatus() != ApprovalStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setStatus(ApprovalStatus.REJECTED);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        index(property);

        return mapper.toResponse(property);
    }

    // ============================================================
    // RENTED / AVAILABLE / DEACTIVATE
    // ============================================================
    public void markAsRented(String id) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        if (property.getStatus() != ApprovalStatus.ACTIVE ||
                property.getPropertyStatus() != PropertyStatus.AVAILABLE) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setPropertyStatus(PropertyStatus.RENTED);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        searchRepository.deleteById(id);
    }

    public void markAsAvailable(String id) {

        Property property = findPropertyOrThrow(id);

        if (property.getPropertyStatus() != PropertyStatus.RENTED) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setPropertyStatus(PropertyStatus.AVAILABLE);
        property.setUpdatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        if (property.getStatus() == ApprovalStatus.ACTIVE) {
            index(saved);
        }
    }

    public void deactivate(String id) {

        Property property = findPropertyOrThrow(id);

        property.setPropertyStatus(PropertyStatus.INACTIVE);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        searchRepository.deleteById(id);
    }

    // ============================================================
    // PUBLIC PROPERTIES
    // ============================================================
    public List<PropertyResponse> getAllPublicProperties() {

        return propertyRepository.findByStatusAndPropertyStatus(
                        ApprovalStatus.ACTIVE,
                        PropertyStatus.AVAILABLE)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> getPropertiesByOwner(String ownerId) {

        return propertyRepository.findByOwner_OwnerId(ownerId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================
    private Property findPropertyOrThrow(String id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_FOUND));
    }

    private Owner fetchOwnerProfile(String userId) {
        try {
            ApiResponse<UserProfileResponse> response = profileClient.getProfile(userId);

            if (response == null || response.getResult() == null)
                throw new AppException(ErrorCode.USER_NOT_EXISTED);

            UserProfileResponse u = response.getResult();

            return Owner.builder()
                    .ownerId(userId)
                    .name(u.getLastName() + " " + u.getFirstName())
                    .email(u.getEmail())
                    .phoneNumber(u.getPhoneNumber())
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch user profile: {}", userId, e);
            throw new AppException(ErrorCode.PROFILE_SERVICE_UNAVAILABLE);
        }
    }

    private void checkOwner(Property property) {

        String userId = getCurrentUserId();
        String role = getCurrentUserRole();

        if ("ADMIN".equals(role)) return;

        if (!property.getOwner().getOwnerId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getCurrentUserRole() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .iterator()
                .next()
                .getAuthority();
    }
}
