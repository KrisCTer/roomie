package com.roomie.services.notification_service.entity;

import com.roomie.services.notification_service.enums.NotificationChannel;
import com.roomie.services.notification_service.enums.NotificationPriority;
import com.roomie.services.notification_service.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "notifications")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
@CompoundIndex(name = "user_read_idx", def = "{'userId': 1, 'isRead': 1}")
public class Notification {
    @Id
    String id;

    @Indexed
    String userId;              // Người nhận

    String title;               // Tiêu đề thông báo
    String message;             // Nội dung chi tiết
    String shortMessage;        // Nội dung ngắn gọn (cho mobile)

    NotificationType type;      // Loại thông báo
    NotificationPriority priority; // Mức độ ưu tiên
    NotificationChannel channel; // Kênh gửi (IN_APP, EMAIL, PUSH)

    String relatedEntityId;     // ID liên quan (propertyId, contractId, bookingId)
    String relatedEntityType;   // Loại entity (PROPERTY, CONTRACT, BOOKING)

    Boolean isRead;             // Đã đọc chưa
    String actionUrl;           // Link để người dùng click vào
    String actionText;          // Text cho button action

    Map<String, Object> metadata; // Dữ liệu bổ sung
    Map<String, String> data;     // Data cho deep linking (mobile)

    String imageUrl;            // Hình ảnh đính kèm
    String iconUrl;             // Icon cho notification

    @Indexed(expireAfterSeconds = 0)
    Instant expiresAt;          // Tự động xóa sau thời gian này

    Instant createdAt;
    Instant readAt;
    Instant sentAt;

    Boolean emailSent;          // Đã gửi email chưa
    Boolean pushSent;           // Đã gửi push notification chưa
}