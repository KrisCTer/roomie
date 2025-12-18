package com.roomie.services.payment_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoMoWebhookRequest {
    String partnerCode;
    String orderId;      // = paymentId
    String requestId;
    Long amount;
    String transId;
    Integer resultCode;  // 0 = success
    String message;
    String signature;
}
