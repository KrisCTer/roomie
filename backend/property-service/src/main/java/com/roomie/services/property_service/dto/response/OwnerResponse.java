package com.roomie.services.property_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OwnerResponse {
    String ownerId;
    String name;
    String phoneNumber;
    String email;
}
