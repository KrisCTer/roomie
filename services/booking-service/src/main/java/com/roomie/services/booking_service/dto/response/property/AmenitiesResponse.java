package com.roomie.services.booking_service.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenitiesResponse {
    List<String> homeSafety;
    List<String> bedroom;
    List<String> kitchen;
    List<String> others;
}
