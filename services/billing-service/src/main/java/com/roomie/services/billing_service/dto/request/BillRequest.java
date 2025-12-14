package com.roomie.services.billing_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillRequest {
    String contractId;

    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    // Electricity
    Double ElectricityOld;
    Double electricityNew;
    Double electricityUnitPrice;

    // Water
    Double waterOld;
    Double waterNew;
    Double waterUnitPrice;

    // Internet
    Double internetPrice;

    // Parking
    Double parkingPrice;

    // Cleaning
    Double cleaningPrice;

    // Maintenance
    Double maintenancePrice;

    // Other
    String otherDescription;
    Double otherPrice;

    String billingMonth;
}