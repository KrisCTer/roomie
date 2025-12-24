package com.roomie.services.notification_service.service;

import com.roomie.services.notification_service.dto.request.CreateNotificationRequest;
import com.roomie.services.notification_service.dto.request.NotificationFilterRequest;
import com.roomie.services.notification_service.dto.response.NotificationResponse;
import com.roomie.services.notification_service.dto.response.NotificationStatsResponse;
import com.roomie.services.notification_service.entity.Notification;
import com.roomie.services.notification_service.enums.NotificationChannel;
import com.roomie.services.notification_service.enums.NotificationType;
import com.roomie.services.notification_service.exception.AppException;
import com.roomie.services.notification_service.exception.ErrorCode;
import com.roomie.services.notification_service.mapper.NotificationMapper;
import com.roomie.services.notification_service.repository.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {

    NotificationRepository notificationRepository;
    NotificationMapper mapper;
    WebSocketNotificationService webSocketService;
    EmailNotificationService emailService;
    NotificationTemplateService templateService;

    /**
     * Tạo thông báo mới
     */
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        log.info("Creating notification for user: {}, type: {}", request.getUserId(), request.getType());

        // Build notification entity
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .shortMessage(request.getShortMessage())
                .type(request.getType())
                .priority(request.getPriority())
                .channel(request.getChannel())
                .relatedEntityId(request.getRelatedEntityId())
                .relatedEntityType(request.getRelatedEntityType())
                .actionUrl(request.getActionUrl())
                .actionText(request.getActionText())
                .metadata(request.getMetadata())
                .data(request.getData())
                .imageUrl(request.getImageUrl())
                .iconUrl(request.getIconUrl())
                .isRead(false)
                .createdAt(Instant.now())
                .sentAt(Instant.now())
                .emailSent(false)
                .pushSent(false)
                .expiresAt(calculateExpiry(request))
                .build();

        // Save to database
        Notification saved = notificationRepository.save(notification);
        log.info("Notification saved with id: {}", saved.getId());

        // Send real-time notification via WebSocket
        if (shouldSendRealtime(request.getChannel())) {
            webSocketService.sendToUser(saved.getUserId(), mapper.toResponse(saved));
        }

        // Send email if needed
        if (shouldSendEmail(request.getChannel())) {
            emailService.sendNotificationEmail(saved);
        }

        return mapper.toResponse(saved);
    }

    /**
     * Tạo notification từ template
     */
    @Transactional
    public NotificationResponse createFromTemplate(
            NotificationType type,
            String userId,
            Map<String, Object> templateData,
            String language
    ) {
        // Render message from template
        String title = templateService.renderTitle(type, templateData, language);
        String message = templateService.renderMessage(type, templateData, language);
        String actionUrl = templateService.renderActionUrl(type, templateData);

        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .metadata(templateData)
                .build();

        return createNotification(request);
    }

    /**
     * Lấy danh sách thông báo
     */
    public Page<NotificationResponse> getUserNotifications(
            String userId,
            int page,
            int size,
            NotificationFilterRequest filter
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Notification> notifications;

        if (filter != null && Boolean.TRUE.equals(filter.getUnreadOnly())) {
            notifications = notificationRepository.findByUserIdAndIsReadFalse(userId, pageable);
        } else if (filter != null && filter.getType() != null) {
            notifications = notificationRepository.findByUserIdAndType(userId, filter.getType(), pageable);
        } else if (filter != null && filter.getFromDate() != null && filter.getToDate() != null) {
            notifications = notificationRepository.findByUserIdAndCreatedAtBetween(
                    userId, filter.getFromDate(), filter.getToDate(), pageable
            );
        } else {
            notifications = notificationRepository.findByUserId(userId, pageable);
        }

        return notifications.map(mapper::toResponse);
    }

    /**
     * Lấy chi tiết notification
     */
    public NotificationResponse getById(String id, String userId) {
        Notification notification = findNotificationOrThrow(id);
        validateOwnership(notification, userId);
        return mapper.toResponse(notification);
    }

    /**
     * Đánh dấu đã đọc
     */
    @Transactional
    public NotificationResponse markAsRead(String id, String userId) {
        Notification notification = findNotificationOrThrow(id);
        validateOwnership(notification, userId);

        if (Boolean.TRUE.equals(notification.getIsRead())) {
            return mapper.toResponse(notification);
        }

        notification.setIsRead(true);
        notification.setReadAt(Instant.now());

        Notification updated = notificationRepository.save(notification);
        log.info("Notification {} marked as read", id);

        return mapper.toResponse(updated);
    }

    /**
     * Đánh dấu nhiều notifications đã đọc
     */
    @Transactional
    public void markMultipleAsRead(List<String> ids, String userId) {
        ids.forEach(id -> {
            try {
                markAsRead(id, userId);
            } catch (Exception e) {
                log.error("Failed to mark notification {} as read", id, e);
            }
        });
    }

    /**
     * Đánh dấu tất cả đã đọc
     */
    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications =
                notificationRepository.findByUserIdAndIsReadFalse(userId);

        Instant now = Instant.now();
        unreadNotifications.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(now);
        });

        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user {}", unreadNotifications.size(), userId);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public long countUnread(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Lấy thống kê notifications
     */
    public NotificationStatsResponse getStats(String userId) {
        Instant today = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        long total = notificationRepository.countByUserIdAndCreatedAtAfter(userId, Instant.EPOCH);
        long unread = notificationRepository.countByUserIdAndIsReadFalse(userId);
        long todayCount = notificationRepository.countByUserIdAndCreatedAtAfter(userId, today);
        long weekCount = notificationRepository.countByUserIdAndCreatedAtAfter(userId, weekAgo);

        // Count by type
        Map<String, Long> byType = new HashMap<>();
        // Count by priority
        Map<String, Long> byPriority = new HashMap<>();

        return NotificationStatsResponse.builder()
                .totalNotifications(total)
                .unreadCount(unread)
                .todayCount(todayCount)
                .thisWeekCount(weekCount)
                .byType(byType)
                .byPriority(byPriority)
                .build();
    }

    /**
     * Xóa thông báo
     */
    @Transactional
    public void deleteNotification(String id, String userId) {
        Notification notification = findNotificationOrThrow(id);
        validateOwnership(notification, userId);

        notificationRepository.delete(notification);
        log.info("Notification {} deleted", id);
    }

    /**
     * Xóa tất cả notifications đã đọc
     */
    @Transactional
    public void deleteAllRead(String userId) {
        List<Notification> readNotifications = notificationRepository
                .findByUserId(userId, Pageable.unpaged())
                .stream()
                .filter(n -> Boolean.TRUE.equals(n.getIsRead()))
                .toList();

        notificationRepository.deleteAll(readNotifications);
        log.info("Deleted {} read notifications for user {}", readNotifications.size(), userId);
    }

    // ============= Helper Methods =============

    private Notification findNotificationOrThrow(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
    }

    private void validateOwnership(Notification notification, String userId) {
        if (!notification.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private Instant calculateExpiry(CreateNotificationRequest request) {
        if (request.getExpiryDays() != null) {
            return Instant.now().plus(request.getExpiryDays(), ChronoUnit.DAYS);
        }

        // Default expiry based on notification type
        return switch (request.getType()) {
            case PAYMENT_DUE_SOON, CONTRACT_EXPIRING_SOON ->
                    Instant.now().plus(30, ChronoUnit.DAYS);
            case SYSTEM_ANNOUNCEMENT ->
                    Instant.now().plus(90, ChronoUnit.DAYS);
            default ->
                    Instant.now().plus(60, ChronoUnit.DAYS);
        };
    }

    private boolean shouldSendRealtime(NotificationChannel channel) {
        return channel == NotificationChannel.IN_APP ||
                channel == NotificationChannel.ALL;
    }

    private boolean shouldSendEmail(NotificationChannel channel) {
        return channel == NotificationChannel.EMAIL ||
                channel == NotificationChannel.ALL;
    }
}