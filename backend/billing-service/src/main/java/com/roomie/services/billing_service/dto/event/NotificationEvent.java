package com.roomie.services.billing_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String userId;              // Người nhận notification
    private String type;                // BOOKING_CREATED, BOOKING_CONFIRMED, etc.
    private String title;               // Tiêu đề
    private String message;             // Nội dung
    private String shortMessage;        // Nội dung ngắn

    private String priority;            // LOW, NORMAL, HIGH, URGENT
    private String channel;             // IN_APP, EMAIL, PUSH, ALL

    private String relatedEntityId;     // bookingId, contractId
    private String relatedEntityType;   // BOOKING, CONTRACT, PAYMENT

    private String actionUrl;           // Link để user click vào
    private String actionText;          // Text cho button

    private Map<String, Object> metadata; // Dữ liệu bổ sung

    private Instant createdAt;
}
