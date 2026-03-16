package com.roomie.services.notification_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationStatsResponse {
    Long totalNotifications;
    Long unreadCount;
    Long todayCount;
    Long thisWeekCount;

    Map<String, Long> byType;
    Map<String, Long> byPriority;
}