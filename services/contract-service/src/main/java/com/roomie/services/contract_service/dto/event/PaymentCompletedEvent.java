package com.roomie.services.contract_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentCompletedEvent {
    String paymentId;
    String bookingId;
    String tenantId;
    String propertyId;
    BigDecimal deposit;
    BigDecimal monthlyRent;
}
