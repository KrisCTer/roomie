package com.roomie.services.property_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
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
