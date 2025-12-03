package com.roomie.services.property_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VirtualTour {
    String type;  // "embedded" hoặc "image"
    String value; // mã nhúng HTML hoặc link ảnh 360
}
