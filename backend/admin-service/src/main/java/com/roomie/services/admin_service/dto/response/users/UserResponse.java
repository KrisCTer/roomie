package com.roomie.services.admin_service.dto.response.users;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String email;
    String phoneNumber;
    boolean emailVerified;
    Set<RoleResponse> roles;
}
