package com.roomie.services.contract_service.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerResponse {
    String ownerId;
    String name;
    String phone;
    String email;
}
