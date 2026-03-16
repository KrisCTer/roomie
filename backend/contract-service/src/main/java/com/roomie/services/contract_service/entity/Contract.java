package com.roomie.services.contract_service.entity;

import com.roomie.services.contract_service.enums.ContractStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contracts")
public class Contract {
    @MongoId
    String id;

    String bookingId;     // optional link to booking
    String propertyId;
    String tenantId;
    String landlordId;    // optional

    Instant startDate;
    Instant endDate;

    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    ContractStatus status;

    boolean tenantSigned;
    boolean landlordSigned;

    String pdfUrl;
    String signatureToken; // HMAC or signature metadata

    @CreatedDate
    Instant createdAt;
    Instant updatedAt;

    @Version
    Long version;
}