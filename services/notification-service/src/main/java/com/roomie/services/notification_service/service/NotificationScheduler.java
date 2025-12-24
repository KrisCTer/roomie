package com.roomie.services.notification_service.service;

import com.roomie.services.notification_service.repository.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationScheduler {

    NotificationRepository notificationRepository;

    /**
     * Xóa notifications đã hết hạn
     * Chạy mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredNotifications() {
        log.info("Starting cleanup of expired notifications");

        try {
            notificationRepository.deleteByExpiresAtBefore(Instant.now());
            log.info("Completed cleanup of expired notifications");
        } catch (Exception e) {
            log.error("Failed to cleanup expired notifications", e);
        }
    }

    /**
     * Log thống kê notifications
     * Chạy mỗi ngày lúc 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void logDailyStats() {
        try {
            long totalCount = notificationRepository.count();
            log.info("Daily notification stats - Total: {}", totalCount);
        } catch (Exception e) {
            log.error("Failed to log daily stats", e);
        }
    }
}