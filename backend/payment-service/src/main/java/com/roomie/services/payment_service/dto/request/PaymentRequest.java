package com.roomie.services.payment_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    String bookingId;
    String contractId;
    String billId;
    long amount;
    String method; // VNPAY, MOMO, CASH
    String description;
}