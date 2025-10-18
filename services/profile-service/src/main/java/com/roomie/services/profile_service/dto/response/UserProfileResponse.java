package com.roomie.services.profile_service.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.roomie.services.profile_service.enums.AccountStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
    LocalDate dob;
    String location;
    AccountStatus status;
    LocalDateTime updatedAt;
}
