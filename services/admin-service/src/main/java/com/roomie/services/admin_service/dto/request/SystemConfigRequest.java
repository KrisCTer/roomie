package com.roomie.services.admin_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemConfigRequest {
    String platformName;
    Boolean maintenanceMode;

    Boolean enableChat;
    Boolean enableBooking;
    Boolean enableRecommendation;
    Boolean enableAnalytics;

    String emailWelcomeTemplate;
    String emailBookingTemplate;

    String smsOtpTemplate;
    String smsBookingTemplate;

    Boolean allowPushNotification;
    Boolean allowEmailNotification;

    String paymentGatewayProvider;
    String paymentApiKey;
    Boolean paymentSandboxMode;

    Integer rateLimitPerMinute;
}
