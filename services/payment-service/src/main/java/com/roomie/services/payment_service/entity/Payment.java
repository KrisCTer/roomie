package com.roomie.services.payment_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "payments")
public class Payment {
    @MongoId
    String id;

    String bookingId;       // liên kết booking
    String contractId;      // cho deposit hoặc bill
    Double amount;
    String method;          // VNPAY, MOMO, CASH
    String status;          // PENDING, PROCESSING, COMPLETED, FAILED
    String transactionId;   // ID do payment gateway tạo ra
    Instant createdAt;
    Instant updatedAt;
}
