package com.roomie.services.booking_service.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {
    String url;
    String type;
    Boolean primary;
    String caption;
}
