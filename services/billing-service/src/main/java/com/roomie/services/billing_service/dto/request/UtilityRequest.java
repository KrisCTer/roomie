package com.roomie.services.billing_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UtilityRequest {

    @NotBlank(message = "Property ID is required")
    String propertyId;

    String contractId; // Optional

    // Electricity
    @NotNull(message = "Electricity unit price is required")
    @Positive(message = "Electricity price must be positive")
    Double electricityUnitPrice;

    String electricityProvider;
    String electricityMeterNumber;

    // Water
    @NotNull(message = "Water unit price is required")
    @Positive(message = "Water price must be positive")
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

    String notes;
}