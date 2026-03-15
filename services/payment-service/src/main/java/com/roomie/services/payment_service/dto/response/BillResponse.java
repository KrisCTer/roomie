package com.roomie.services.billing_service.dto.response;

import com.roomie.services.billing_service.enums.BillStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
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

    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    Double electricityOld;
    Double electricityNew;
    Double electricityConsumption;
    Double electricityUnitPrice;
    BigDecimal electricityAmount;

    Double waterOld;
    Double waterNew;
    Double waterConsumption;
    Double waterUnitPrice;
    BigDecimal waterAmount;

    BigDecimal internetPrice;

    BigDecimal parkingPrice;

    BigDecimal cleaningPrice;

    BigDecimal maintenancePrice;

    String otherDescription;
    BigDecimal otherPrice;

    BigDecimal totalAmount;

    LocalDate billingMonth;
    LocalDate dueDate;
    BillStatus status;

    String notes;

    Instant createdAt;
    Instant updatedAt;
}
