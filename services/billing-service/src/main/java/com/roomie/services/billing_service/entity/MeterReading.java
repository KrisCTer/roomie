package com.roomie.services.billing_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Meter Reading History
 * Tracks historical meter readings for electricity, water, gas
 */
@Document(collection = "meter_readings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterReading {
    @MongoId
    String id;

    // References
    String propertyId;
    String contractId;
    String billId; // Associated bill

    // Reading Period
    LocalDate readingMonth; // YYYY-MM-01
    LocalDate readingDate;  // Actual date of reading

    // Electricity
    Double electricityReading;
    String electricityPhotoUrl; // Photo of meter

    // Water
    Double waterReading;
    String waterPhotoUrl;

    // Metadata
    String recordedBy; // landlordId or tenantId
    String notes;

    Instant createdAt;
}