package com.roomie.services.profile_service.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.roomie.services.profile_service.enums.AccountStatus;
import com.roomie.services.profile_service.enums.Gender;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Node("user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(generatorClass = UUIDStringGenerator.class)
    String id;
    @Property("userId")
    String userId;

    String avatar;
    String username;
    @Property("email")
    String email;
    @Property("phoneNumber")
    String phoneNumber;

    @Property("firstName")
    String firstName;
    @Property("lastName")
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
