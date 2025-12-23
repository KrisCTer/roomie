package com.roomie.services.billing_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoMoPaymentResponse {
    String partnerCode;
    String orderId;
    String requestId;
    Long amount;
    Long responseTime;
    String message;
    Integer resultCode;

    // Payment URLs
    String payUrl;        // URL để redirect user
    String qrCodeUrl;     // URL của QR code image (dùng để download)
    String deeplink;      // Deep link để mở app MoMo
    String deeplinkWebInApp; // Deep link cho webview

    // App deep link
    String applink;       // App link alternative
}