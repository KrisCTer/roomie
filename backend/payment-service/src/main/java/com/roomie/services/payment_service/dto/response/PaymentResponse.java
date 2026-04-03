package com.roomie.services.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

/**
 * Payment response DTO for client-facing API responses.
 *
 * <p>Contains the payment status and all relevant transaction details.
 * Used by the frontend to display payment information and check payment status.
 *
 * <p>Status values:
 * <ul>
 *   <li>{@code PENDING} — Payment created, awaiting gateway response</li>
 *   <li>{@code COMPLETED} — Payment confirmed by gateway (MoMo/VNPay)</li>
 *   <li>{@code FAILED} — Payment failed or cancelled by user</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String id;
    String userId;
    String bookingId;
    String contractId;
    String billId;

    long amount;

    /** Payment method: MOMO, VNPAY, or CASH */
    String method;

    /** Current payment status: PENDING, COMPLETED, or FAILED */
    String status;

    /** Transaction ID assigned by the payment gateway (MoMo transId / VNPay transactionId) */
    String transactionId;

    String description;

    /** URL to redirect the user to for payment (MoMo payUrl / VNPay payment URL) */
    String paymentUrl;

    /** Timestamp when payment was confirmed as completed */
    Instant paidAt;

    Instant createdAt;
    Instant updatedAt;
}
