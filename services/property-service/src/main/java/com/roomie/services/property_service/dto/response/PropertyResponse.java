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
    String priceLabel;
    BigDecimal rentalDeposit;

    PropertyType propertyType;
    PropertyStatus propertyStatus;
    PropertyLabel propertyLabel;

    Double size;
    Double landArea;

    Integer rooms;
    Integer bedrooms;
    Integer bathrooms;
    Integer garages;

    Integer yearBuilt;

    AddressResponse address;  // Cần có đầy đủ: fullAddress, zipCode, country, neighborhood, province, location
    AmenitiesResponse amenities;  // Cần có đầy đủ: homeSafety, bedroom, kitchen
    List<MediaResponse> mediaList;
    VirtualTourResponse virtualTour;
    List<FloorResponse> floors;

    OwnerResponse owner;
    ApprovalStatus status;

    Instant createdAt;
    Instant updatedAt;
}