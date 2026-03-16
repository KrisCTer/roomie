package com.roomie.services.admin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemConfigResponse {
    String id;

    // Platform
    String platformName;
    Boolean maintenanceMode;

    // Feature flags
    Boolean enableChat;
    Boolean enableBooking;
    Boolean enableRecommendation;
    Boolean enableAnalytics;

    // Email templates
    String emailWelcomeTemplate;
    String emailBookingTemplate;

    // SMS templates
    String smsOtpTemplate;
    String smsBookingTemplate;

    // Notifications
    Boolean allowPushNotification;
    Boolean allowEmailNotification;

    // Payment config
    String paymentGatewayProvider;
    String paymentApiKey;
    Boolean paymentSandboxMode;

    // Rate limit
    Integer rateLimitPerMinute;

    Instant updatedAt;
}
