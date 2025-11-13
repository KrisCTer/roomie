package com.roomie.services.property_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenitiesRequest {
    List<String> homeSafety;
    List<String> bedroom;
    List<String> kitchen;
    List<String> others;
}
