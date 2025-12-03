package com.roomie.services.property_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Address {
    String fullAddress;
//    String country;
    String province;
    String district;
    String ward;
    String street;
    String houseNumber;
    String location; // có thể lưu lat,lng dạng "10.762622,106.660172"
}
