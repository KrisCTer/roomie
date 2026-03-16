package com.roomie.services.notification_service.entity;

import com.roomie.services.notification_service.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "notification_templates")
public class NotificationTemplate {
    @Id
    String id;

    NotificationType type;
    String language;            // "vi" hoặc "en"

    String titleTemplate;       // Template cho title (có thể dùng placeholder)
    String messageTemplate;     // Template cho message
    String shortMessageTemplate;

    String emailSubjectTemplate;
    String emailBodyTemplate;

    String actionText;
    String actionUrlTemplate;

    Boolean isActive;
    Instant createdAt;
    Instant updatedAt;
}