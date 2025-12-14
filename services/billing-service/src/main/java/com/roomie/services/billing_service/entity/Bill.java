package com.roomie.services.billing_service.entity;

import com.roomie.services.billing_service.enums.BillStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "bills")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Bill {
    @MongoId
    String id;

    // References
    String contractId;
    String paymentId;
    String landlordId;
    String tenantId;
    String propertyId;

    // Rent
    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    // Electricity
    Double electricityOld;
    Double electricityNew;
    Double electricityConsumption;
    Double electricityUnitPrice;
    BigDecimal electricityAmount;

    // Water
    Double waterOld;
    Double waterNew;
    Double waterConsumption;
    Double waterUnitPrice;
    BigDecimal waterAmount;

    // Fixed costs
    BigDecimal internetPrice;
    BigDecimal parkingPrice;
    BigDecimal cleaningPrice;
    BigDecimal maintenancePrice;

    // Other
    String otherDescription;
    BigDecimal otherPrice;

    // Total
    BigDecimal totalAmount;

    // Billing period
    LocalDate billingMonth;
    LocalDate dueDate;

    // Status
    BillStatus status;

    // Notes
    String notes;

    // Timestamps
    Instant paidAt;
    Instant createdAt;
    Instant updatedAt;
}