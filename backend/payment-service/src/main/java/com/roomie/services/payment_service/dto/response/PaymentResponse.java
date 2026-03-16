package com.roomie.services.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String id;
    String bookingId;
    String billId;
    String contractId;
    BigDecimal amount;
    String description;
    String paymentUrl;
    String method;
    String status;
    String transactionId;
    Instant createdAt;
    Instant updatedAt;
}
