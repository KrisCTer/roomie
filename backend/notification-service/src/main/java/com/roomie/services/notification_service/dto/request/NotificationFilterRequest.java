package com.roomie.services.notification_service.dto.request;

import com.roomie.services.notification_service.enums.NotificationPriority;
import com.roomie.services.notification_service.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationFilterRequest {
    Boolean unreadOnly;
    NotificationType type;
    NotificationPriority priority;
    String relatedEntityType;
    Instant fromDate;
    Instant toDate;
}