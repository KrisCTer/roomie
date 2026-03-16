package com.roomie.services.property_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenitiesRequest {
    List<String> homeSafety;
    List<String> bedroom;
    List<String> kitchen;
    List<String> others;
}
