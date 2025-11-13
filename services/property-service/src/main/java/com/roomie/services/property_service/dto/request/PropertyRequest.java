package com.roomie.services.property_service.dto.request;

import com.roomie.services.property_service.entity.Address;
import com.roomie.services.property_service.entity.Media;
import com.roomie.services.property_service.entity.Owner;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {
    @NotBlank
    String title;
    String description;
    @NotNull
    BigDecimal price;
    String priceLabel;
    String propertyType;
    String propertyStatus;
    Double size;
    Integer rooms;
    Integer bedrooms;
    Integer bathrooms;
    AddressRequest address;
    AmenitiesRequest amenities;
    List<MediaRequest> mediaList;
    VirtualTourRequest virtualTour;
    List<FloorRequest> floors;
    OwnerRequest owner;
}
