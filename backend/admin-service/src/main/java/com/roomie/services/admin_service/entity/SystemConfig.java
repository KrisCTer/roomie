package com.roomie.services.admin_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemConfig {
    @MongoId
    String id;

    // Platform settings
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

    // Notification Settings
    Boolean allowPushNotification;
    Boolean allowEmailNotification;

    // Payment gateway configuration
    String paymentGatewayProvider;
    String paymentApiKey;
    Boolean paymentSandboxMode;

    // API rate limit
    Integer rateLimitPerMinute;

    // Updated time
    Instant updatedAt;
}