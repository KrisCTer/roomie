package com.roomie.services.notification_service.dto.response;

import com.roomie.services.notification_service.enums.NotificationChannel;
import com.roomie.services.notification_service.enums.NotificationPriority;
import com.roomie.services.notification_service.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String userId;
    String title;
    String message;
    String shortMessage;

    NotificationType type;
    NotificationPriority priority;
    NotificationChannel channel;

    String relatedEntityId;
    String relatedEntityType;

    Boolean isRead;
    String actionUrl;
    String actionText;

    Map<String, Object> metadata;
    Map<String, String> data;

    String imageUrl;
    String iconUrl;

    Instant createdAt;
    Instant readAt;
    Instant expiresAt;

    // Helper method
    public String getTimeAgo() {
        // Implement time ago logic
        return "2 hours ago";
    }
}