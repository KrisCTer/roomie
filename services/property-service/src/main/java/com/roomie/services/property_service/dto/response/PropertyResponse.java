package com.roomie.services.property_service.dto.response;

import com.roomie.services.property_service.entity.Address;
import com.roomie.services.property_service.entity.Media;
import com.roomie.services.property_service.entity.Owner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    String id;
    String title;
    String description;
    BigDecimal price;
    String priceLabel;
    String propertyType;
    String propertyStatus;
    Double size;
    Integer rooms;
    Integer bedrooms;
    Integer bathrooms;
    AddressResponse address;
    AmenitiesResponse amenities;
    List<MediaResponse> mediaList;
    VirtualTourResponse virtualTour;
    List<FloorResponse> floors;
    OwnerResponse owner;
    Instant createdAt;
    Instant updatedAt;
}
