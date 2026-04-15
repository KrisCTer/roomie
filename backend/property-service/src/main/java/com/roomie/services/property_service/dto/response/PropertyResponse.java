package com.roomie.services.property_service.dto.response;

import com.roomie.services.property_service.enums.ApprovalStatus;
import com.roomie.services.property_service.enums.PropertyLabel;
import com.roomie.services.property_service.enums.PropertyStatus;
import com.roomie.services.property_service.enums.PropertyType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyResponse {
    String propertyId;
    String title;
    String description;

    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    PropertyType propertyType;
    PropertyStatus propertyStatus;
    PropertyLabel propertyLabel;

    Double size;

    Integer rooms;
    Integer bedrooms;
    Integer bathrooms;
    Integer garages;

    AddressResponse address;  // Cần có đầy đủ: fullAddress, zipCode, country, neighborhood, province, location
    AmenitiesResponse amenities;  // Cần có đầy đủ: homeSafety, bedroom, kitchen
    List<MediaResponse> mediaList;

    OwnerResponse owner;
    ApprovalStatus status;

    Long favoriteCount;
    Boolean isFavorited;

    String coverImageUrl;

    // 3D Model reconstruction
    /** URL to the 3D model file (GLB/GLTF), null if not yet generated */
    String model3dUrl;
    /** Reconstruction status: NONE, PROCESSING, COMPLETED, FAILED */
    String model3dStatus;
    /** Whether the 3D viewer is visible on the property detail page */
    Boolean model3dVisible;
    Instant model3dRequestedAt;
    Instant model3dCompletedAt;

    Instant createdAt;
    Instant updatedAt;
}