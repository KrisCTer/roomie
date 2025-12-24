package com.roomie.services.notification_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentEvent {
    String paymentId;
    String userId;
    String userName;
    String bookingId;
    String contractId;
    BigDecimal amount;
    String currency;
    String paymentMethod;
    String status;
    Instant paidAt;
    String description;
}