package com.roomie.services.property_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Model3dCallbackRequest {
    String propertyId;
    String model3dUrl;
    String status;        // COMPLETED | FAILED
    String errorMessage;
}
