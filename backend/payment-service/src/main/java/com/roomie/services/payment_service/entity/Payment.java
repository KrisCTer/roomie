package com.roomie.services.payment_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

/**
 * Payment entity stored in MongoDB {@code payments} collection.
 *
 * <p>Represents a single payment transaction in the Roomie system.
 * Each payment is linked to either a booking, contract, or bill.
 *
 * <p>Lifecycle:
 * <pre>
 *   PENDING → COMPLETED (on successful gateway callback)
 *   PENDING → FAILED    (on failed/cancelled payment)
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "payments")
public class Payment {
    @MongoId
    String id;

    String userId;
    String bookingId;
    String contractId;
    String billId;

    long amount;

    /** Payment method: VNPAY, MOMO, CASH */
    String method;

    /** Payment status: PENDING, PROCESSING, COMPLETED, FAILED */
    String status;

    /** Transaction ID from payment gateway (MoMo transId / VNPay transactionId) */
    String transactionId;

    String description;

    /** Payment URL for gateway redirect (MoMo payUrl / VNPay payment URL) */
    String paymentUrl;

    Instant paidAt;
    Instant createdAt;
    Instant updatedAt;
}