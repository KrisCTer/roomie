package com.roomie.services.property_service.dto.response;

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
