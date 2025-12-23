package com.roomie.services.billing_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Utility Configuration for Property/Contract
 * Stores default unit prices and service configurations
 */
@Document(collection = "utilities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Utility {
    @MongoId
    String id;

    // References
    String propertyId;
    String contractId; // Optional: if utility config is per contract
    String landlordId;

    // Electricity Configuration
    Double electricityUnitPrice;
    String electricityProvider;
    String electricityMeterNumber;

    // Water Configuration
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
    String cleaningFrequency; // WEEKLY, MONTHLY

    BigDecimal maintenancePrice;
    String maintenanceCoverage;

    // Status
    boolean active;

    // Metadata
    String notes;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}