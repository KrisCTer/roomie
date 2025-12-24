package com.roomie.services.notification_service.service;

import com.roomie.services.notification_service.dto.response.NotificationResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WebSocketNotificationService {

    SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi notification đến một user cụ thể
     */
    public void sendToUser(String userId, NotificationResponse notification) {
        try {
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications",
                    notification
            );
            log.info("Sent real-time notification to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to user: {}", userId, e);
        }
    }

    /**
     * Gửi notification count update
     */
    public void sendUnreadCountUpdate(String userId, long count) {
        try {
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/unread-count",
                    count
            );
            log.debug("Sent unread count update to user: {} - count: {}", userId, count);
        } catch (Exception e) {
            log.error("Failed to send unread count to user: {}", userId, e);
        }
    }

    /**
     * Broadcast notification to all users
     */
    public void broadcastToAll(NotificationResponse notification) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications",
                    notification
            );
            log.info("Broadcast notification to all users");
        } catch (Exception e) {
            log.error("Failed to broadcast notification", e);
        }
    }
}