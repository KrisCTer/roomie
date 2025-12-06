package com.roomie.services.contract_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "otp_verifications")
public class OTPVerification {
    @MongoId
    String id;

    String contractId;
    String userId;
    String email;
    String otpCode;
    String purpose; // "TENANT_SIGN" or "LANDLORD_SIGN"

    Boolean verified;
    Instant expiresAt;

    @CreatedDate
    Instant createdAt;
}