package com.roomie.services.billing_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UtilityResponse {
    String id;
    String propertyId;
    String contractId;
    String landlordId;

    // Electricity
    Double electricityUnitPrice;
    String electricityProvider;
    String electricityMeterNumber;

    // Water
    Double waterUnitPrice;
    String waterProvider;
    String waterMeterNumber;

    // Fixed Services
    BigDecimal internetPrice;
    String internetProvider;
    String internetPackage;

    BigDecimal parkingPrice;
    Integer parkingSlots;

    BigDecimal cleaningPrice;
    String cleaningFrequency;

    BigDecimal maintenancePrice;
    String maintenanceCoverage;

    boolean active;
    String notes;

    Instant createdAt;
    Instant updatedAt;
}