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
    Double electricityOld;
    Double electricityNew;
    Double electricityUnitPrice;

    // Water
    Double waterOld;
    Double waterNew;
    Double waterUnitPrice;

    // Internet
    BigDecimal  internetPrice;

    // Parking
    BigDecimal  parkingPrice;

    // Cleaning
    BigDecimal  cleaningPrice;

    // Maintenance
    BigDecimal  maintenancePrice;

    // Other
    String otherDescription;
    BigDecimal  otherPrice;

    String notes;

    String billingMonth;
}