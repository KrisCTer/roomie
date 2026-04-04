package com.roomie.services.property_service.service;

import co.elastic.clients.elasticsearch._types.GeoDistanceType;
import co.elastic.clients.elasticsearch._types.SortOrder;
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
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PropertyService {

    PropertyRepository propertyRepository;
    PropertySearchRepository searchRepository;
    PropertyMapper propertyMapper;
    ProfileClient profileClient;
    FavoriteService favoriteService;
    PropertyLabelService propertyLabelService;
    ElasticsearchOperations elasticsearchOperations;

    @CacheEvict(value = "properties", allEntries = true)
    public PropertyResponse create(PropertyRequest request) {
        Property entity = propertyMapper.toEntity(request);
        String userId = getCurrentUserId();
        Owner owner = fetchOwnerProfile(userId);

        entity.setOwner(owner);
        entity.setStatus(ApprovalStatus.DRAFT);
        entity.setPropertyStatus(PropertyStatus.INACTIVE);
        entity.setPropertyLabel(PropertyLabel.NONE);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        Property saved = propertyRepository.save(entity);

        index(saved);

        return propertyMapper.toResponse(saved);
    }

    @CacheEvict(value = "properties", key = "#id")
    public PropertyResponse update(String id, PropertyRequest request) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        updatePropertyFields(property, request);
        property.setUpdatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        index(saved);

        return propertyMapper.toResponse(saved);
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

    @CacheEvict(value = "properties", key = "#id")
    public void delete(String id) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        propertyRepository.deleteById(id);
        searchRepository.deleteById(id);
    }

    public PropertyResponse getById(String id) {
        Property property = findPropertyOrThrow(id);
        PropertyResponse response = propertyMapper.toResponse(property);

        // Add favorite count and status if user is authenticated
        try {
            String userId = getCurrentUserId();
            if (userId != null) {
                // This info can be added to response or handled in frontend
                long favoriteCount = favoriteService.getFavoriteCount(id);
                boolean isFavorited = favoriteService.isFavorited(id);
                // You can add these to PropertyResponse if needed
            }
        } catch (Exception e) {
            // User not authenticated, skip favorite info
        }

        return response;
    }

    public List<PropertyResponse> findAll(int page, int size) {
        return propertyRepository.findAll(PageRequest.of(page, size))
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    public List<PropertyResponse> findByStatus(ApprovalStatus status) {
        return propertyRepository.findByStatus(status)
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    public List<PropertyResponse> findByPriceRange(BigDecimal min, BigDecimal max) {
        return propertyRepository.findByMonthlyRentBetween(min, max)
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    public List<PropertyResponse> findByProvince(String province) {
        return propertyRepository.findByAddress_ProvinceIgnoreCase(province)
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    public List<PropertyResponse> getMyProperties() {

        String userId = getCurrentUserId();

        return propertyRepository.findAllByOwner_OwnerId(userId)
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

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
                .toList();
    }

    public List<NearbyPropertyResponse> searchNearby(double lat, double lng, double radiusKm, int page, int size) {
        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> b
                        .filter(f -> f.geoDistance(gd -> gd
                                .field("location")
                                .location(loc -> loc.latlon(ll -> ll.lat(lat).lon(lng)))
                                .distance(radiusKm + "km")
                                .distanceType(GeoDistanceType.Arc)
                        ))
                ))
                .withSort(s -> s.geoDistance(g -> g
                        .field("location")
                        .location(loc -> loc.latlon(ll -> ll.lat(lat).lon(lng)))
                        .order(SortOrder.Asc)
                        .unit(co.elastic.clients.elasticsearch._types.DistanceUnit.Kilometers)
                ))
                .withPageable(PageRequest.of(page, size))
                .build();

        SearchHits<PropertyDocument> searchHits = elasticsearchOperations.search(query, PropertyDocument.class);

        List<NearbyPropertyResponse> results = new ArrayList<>();

        for (SearchHit<PropertyDocument> hit : searchHits.getSearchHits()) {
            PropertyDocument doc = hit.getContent();

            Double distanceKm = null;
            if (!hit.getSortValues().isEmpty()) {
                Object sortVal = hit.getSortValues().get(0);
                if (sortVal instanceof Number) {
                    distanceKm = Math.round(((Number) sortVal).doubleValue() * 100.0) / 100.0;
                }
            }

            Optional<Property> propertyOpt = propertyRepository.findById(doc.getPropertyId());
            if (propertyOpt.isEmpty()) continue;

            PropertyResponse response = propertyMapper.toResponse(propertyOpt.get());

            results.add(NearbyPropertyResponse.builder()
                    .property(response)
                    .distanceKm(distanceKm)
                    .build());
        }

        return results;
    }

    public void reindexAll() {

        searchRepository.deleteAll();

        propertyRepository.findAll().forEach(this::index);
    }

    private void index(Property p) {
        try {
            PropertyDocument doc = propertyMapper.toDocument(p);
            doc.setPropertyId(p.getPropertyId());
            doc.setCreatedAt(p.getCreatedAt());
            doc.setUpdatedAt(p.getUpdatedAt());
            searchRepository.save(doc);
        } catch (Exception e) {
            log.error("Failed to index property {}: {}", p.getPropertyId(), e.getMessage());
        }
    }

    public PropertyResponse publish(String id) {

        Property property = findPropertyOrThrow(id);
        checkOwner(property);

        if (property.getStatus() != ApprovalStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setStatus(ApprovalStatus.PENDING);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        return propertyMapper.toResponse(property);
    }

    public PropertyResponse approve(String id) {

        Property property = findPropertyOrThrow(id);

        if (property.getStatus() != ApprovalStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        property.setStatus(ApprovalStatus.ACTIVE);
        property.setPropertyStatus(PropertyStatus.AVAILABLE);
        PropertyLabel calculatedLabel = propertyLabelService.calculateLabel(property);
        property.setPropertyLabel(calculatedLabel);
        property.setUpdatedAt(Instant.now());
        propertyRepository.save(property);

        index(property);

        return propertyMapper.toResponse(property);
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

        return propertyMapper.toResponse(property);
    }

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

    public List<PropertyResponse> getAllPublicProperties() {
        return propertyRepository.findByStatusAndPropertyStatus(
                        ApprovalStatus.ACTIVE,
                        PropertyStatus.AVAILABLE)
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    public List<PropertyResponse> getPropertiesByOwner(String ownerId) {

        return propertyRepository.findByOwner_OwnerId(ownerId)
                .stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

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
