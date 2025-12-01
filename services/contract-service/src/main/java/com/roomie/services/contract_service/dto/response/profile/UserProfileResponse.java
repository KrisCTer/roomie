package com.roomie.services.contract_service.dto.response.profile;

import com.roomie.services.contract_service.enums.AccountStatus;
import com.roomie.services.contract_service.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    String id;
    String userId;

    String avatar;
    String username;
    String email;
    String phoneNumber;

    String firstName;
    String lastName;
    Gender gender;
    LocalDate dob;

    String idCardNumber;
    String permanentAddress;

    String currentAddress;

    AccountStatus status;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
