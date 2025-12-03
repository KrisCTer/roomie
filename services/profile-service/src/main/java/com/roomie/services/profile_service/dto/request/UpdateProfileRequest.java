package com.roomie.services.profile_service.dto.request;

import com.roomie.services.profile_service.enums.AccountStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProfileRequest {
    String email;
    String firstName;
    String lastName;
    String phoneNumber;
    LocalDate dob;
    String permanentAddress;
    String currentAddress;
    String idCardNumber;
    AccountStatus status;
}
