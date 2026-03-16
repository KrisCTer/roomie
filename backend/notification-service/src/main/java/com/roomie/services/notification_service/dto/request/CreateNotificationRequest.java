package com.roomie.services.notification_service.dto.request;

import com.roomie.services.notification_service.enums.NotificationChannel;
import com.roomie.services.notification_service.enums.NotificationPriority;
import com.roomie.services.notification_service.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateNotificationRequest {
    String userId;
    String title;
    String message;
    String shortMessage;

    NotificationType type;

    @Builder.Default
    NotificationPriority priority = NotificationPriority.NORMAL;

    @Builder.Default
    NotificationChannel channel = NotificationChannel.IN_APP;

    String relatedEntityId;
    String relatedEntityType;

    String actionUrl;
    String actionText;

    Map<String, Object> metadata;
    Map<String, String> data;

    String imageUrl;
    String iconUrl;

    Integer expiryDays; // Số ngày hết hạn
}