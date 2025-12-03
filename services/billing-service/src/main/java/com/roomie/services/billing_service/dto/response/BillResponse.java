package com.roomie.services.billing_service.dto.response;

import com.roomie.services.billing_service.enums.BillStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillResponse {
    String id;
    String contractId;

    Double rentPrice;

    Double electricityOld;
    Double electricityNew;
    Double electricityConsumption;
    Double electricityUnitPrice;
    Double electricityAmount;

    Double waterOld;
    Double waterNew;
    Double waterConsumption;
    Double waterUnitPrice;
    Double waterAmount;

    Double internetPrice;

    Double parkingPrice;

    Double cleaningPrice;

    Double maintenancePrice;

    String otherDescription;
    Double otherPrice;

    Double totalAmount;

    LocalDate billingMonth;
    LocalDate dueDate;
    BillStatus status;

    Instant createdAt;
    Instant updatedAt;
}
