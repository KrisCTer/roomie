package com.roomie.services.contract_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractEvent {
    String contractId;
    String bookingId;
    String tenantId;
    String propertyId;
    Instant startDate;
    Instant endDate;
}
