package com.roomie.services.billing_service.entity;

import com.roomie.services.billing_service.enums.BillStatus;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "bills")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @MongoId
    String id;
    String contractId;

    // RENT
    Double rentPrice;

    // ELECTRICITY
    Double electricityOld;  // chỉ số cũ
    Double electricityNew;  // chỉ số mới
    Double electricityConsumption; // auto = new - old
    Double electricityUnitPrice;   // do chủ điền
    Double electricityAmount;

    // WATER
    Double waterOld;
    Double waterNew;
    Double waterConsumption;
    Double waterUnitPrice;
    Double waterAmount;

    // INTERNET (không theo chỉ số, theo gói tháng)
    Double internetPrice;

    // PARKING
    Double parkingPrice;

    // CLEANING
    Double cleaningPrice;

    // MAINTENANCE
    Double maintenancePrice;

    // OTHER
    String otherDescription;
    Double otherPrice;

    Double totalAmount;

    LocalDate billingMonth;
    LocalDate dueDate;

    BillStatus status;

    Instant createdAt;
    Instant updatedAt;
}
