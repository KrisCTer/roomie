package com.roomie.services.identity_service.dto.request;

import com.roomie.services.identity_service.enums.UserRole;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    String username;
    String email;
    String password;
    String firstName;
    String lastName;
    String phoneNumber;
    LocalDate dob;
    String city;
    Set<UserRole> roles;
}