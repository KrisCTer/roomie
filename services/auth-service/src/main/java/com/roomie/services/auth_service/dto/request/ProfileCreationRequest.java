package com.roomie.services.auth_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCreationRequest {
    String userId;
    String username;
    String email;
    String firstName;
    String lastName;
    String phoneNumber;
    LocalDate dob;
    String city;
}
