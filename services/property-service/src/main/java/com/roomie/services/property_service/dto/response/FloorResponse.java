package com.roomie.services.property_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorResponse {
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
