package com.roomie.services.property_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
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
