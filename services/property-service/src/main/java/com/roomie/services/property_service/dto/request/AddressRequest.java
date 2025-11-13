package com.roomie.services.property_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    String fullAddress;
     String province;
     String district;
     String ward;
     String street;
     String houseNumber;
     String location;
}
