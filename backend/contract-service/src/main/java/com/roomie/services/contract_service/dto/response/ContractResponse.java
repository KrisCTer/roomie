package com.roomie.services.contract_service.dto.response;

import com.roomie.services.contract_service.enums.ContractStatus;
import com.roomie.services.contract_service.entity.ContractAmendment;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

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
    List<String> supplementaryTerms;
    List<ContractAmendment> amendments;
    Instant createdAt;
    Instant updatedAt;
}
