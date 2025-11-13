package com.roomie.services.property_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Amenities {
    List<String> homeSafety;   // Ví dụ: ["Smoke alarm", "Security cameras"]
    List<String> bedroom;      // ["Hangers", "TV"]
    List<String> kitchen;      // ["Refrigerator", "Microwave"]
    List<String> others;
}
