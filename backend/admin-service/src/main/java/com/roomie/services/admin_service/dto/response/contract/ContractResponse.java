package com.roomie.services.admin_service.dto.response.contract;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
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
    String status;
    boolean tenantSigned;
    boolean landlordSigned;
    String pdfUrl;
    Instant createdAt;
    Instant updatedAt;
}
