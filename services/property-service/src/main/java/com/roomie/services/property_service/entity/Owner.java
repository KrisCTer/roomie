package com.roomie.services.property_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Owner {
    String ownerId;           // id user đăng bài
    String name;
    String phone;
    String email;
}
