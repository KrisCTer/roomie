package com.roomie.services.profile_service.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.roomie.services.profile_service.enums.AccountStatus;
import com.roomie.services.profile_service.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.neo4j.core.schema.Property;

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
