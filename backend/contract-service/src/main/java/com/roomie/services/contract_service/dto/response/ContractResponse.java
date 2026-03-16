package com.roomie.services.contract_service.dto.response;

import com.roomie.services.contract_service.enums.ContractStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractResponse {
    String id;
    String bookingId;
    String propertyId;
    String tenantId;
    String landlordId;
    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;
    Instant startDate;
    Instant endDate;
    ContractStatus status;
    boolean tenantSigned;
    boolean landlordSigned;
    String pdfUrl;
    Instant createdAt;
    Instant updatedAt;
}
