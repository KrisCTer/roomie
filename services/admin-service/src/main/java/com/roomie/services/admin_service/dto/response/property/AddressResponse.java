package com.roomie.services.admin_service.dto.response.property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
        String fullAddress;
        String province;
        String district;
        String ward;
        String street;
        String houseNumber;
        String location;
}
