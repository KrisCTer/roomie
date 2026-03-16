package com.roomie.services.billing_service.dto.response.property;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenitiesResponse {
    List<String> homeSafety;
    List<String> bedroom;
    List<String> kitchen;
    List<String> others;
}
