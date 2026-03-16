package com.roomie.services.contract_service.dto.response.property;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressResponse {
    String fullAddress;
    String province;
    String district;
    String ward;
    String street;
    String houseNumber;
    String location;
}
