package com.roomie.services.admin_service.dto.response.property;

import com.roomie.services.admin_service.enums.ApprovalStatus;
import com.roomie.services.admin_service.enums.PropertyLabel;
import com.roomie.services.admin_service.enums.PropertyStatus;
import com.roomie.services.admin_service.enums.PropertyType;
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

    Instant createdAt;
    Instant updatedAt;
}