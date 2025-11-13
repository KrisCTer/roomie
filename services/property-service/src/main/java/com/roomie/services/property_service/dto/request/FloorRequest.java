package com.roomie.services.property_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorRequest {
    String name;
    Double price;
    String pricePostfix;
    Double size;
    String sizePostfix;
    Integer bedrooms;
    Integer bathrooms;
    String imageUrl;
    String description;
}
