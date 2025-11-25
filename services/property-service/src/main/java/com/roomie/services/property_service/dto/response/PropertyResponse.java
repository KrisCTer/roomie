package com.roomie.services.property_service.dto.response;

import com.roomie.services.property_service.enums.PropertyStatus;
import com.roomie.services.property_service.enums.RentalType;
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
    BigDecimal price;
    String priceLabel;
    BigDecimal rentalDeposit;

    String propertyType;
    String propertyStatus;
    String propertyLabel;

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
    PropertyStatus status;
    RentalType rentalType;

    Instant createdAt;
    Instant updatedAt;
}