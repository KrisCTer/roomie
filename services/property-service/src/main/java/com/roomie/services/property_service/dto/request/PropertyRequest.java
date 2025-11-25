package com.roomie.services.property_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyRequest {
    @NotBlank
    String title;
    String description;

    @NotNull
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

    String rentalType;

    AddressRequest address;
    AmenitiesRequest amenities;
    List<MediaRequest> mediaList;
    VirtualTourRequest virtualTour;
    List<FloorRequest> floors;
}
