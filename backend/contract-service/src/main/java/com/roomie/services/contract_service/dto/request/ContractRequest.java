package com.roomie.services.contract_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractRequest {
    String bookingId;
    String propertyId;
    String tenantId;
    String landlordId;
    Instant startDate;
    Instant endDate;
}
