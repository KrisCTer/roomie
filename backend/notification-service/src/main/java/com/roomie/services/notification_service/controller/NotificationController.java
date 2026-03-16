package com.roomie.services.notification_service.controller;

import com.roomie.services.notification_service.dto.request.CreateNotificationRequest;
import com.roomie.services.notification_service.dto.request.NotificationFilterRequest;
import com.roomie.services.notification_service.dto.response.ApiResponse;
import com.roomie.services.notification_service.dto.response.NotificationResponse;
import com.roomie.services.notification_service.dto.response.NotificationStatsResponse;
import com.roomie.services.notification_service.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {

    NotificationService notificationService;

    /**
     * Lấy danh sách thông báo của user
     */
    @GetMapping
    public ApiResponse<Page<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unreadOnly,
            @ModelAttribute NotificationFilterRequest filter
    ) {
        String userId = getCurrentUserId();

        if (filter == null) {
            filter = new NotificationFilterRequest();
        }
        filter.setUnreadOnly(unreadOnly);

        Page<NotificationResponse> notifications =
                notificationService.getUserNotifications(userId, page, size, filter);

        return ApiResponse.success(notifications, "Notifications retrieved successfully");
    }

    /**
     * Lấy chi tiết một notification
     */
    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse> getNotification(@PathVariable String id) {
        String userId = getCurrentUserId();
        NotificationResponse notification = notificationService.getById(id, userId);
        return ApiResponse.success(notification, "Notification retrieved successfully");
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        String userId = getCurrentUserId();
        long count = notificationService.countUnread(userId);
        return ApiResponse.success(count, "Unread count retrieved successfully");
    }

    /**
     * Lấy thống kê notifications
     */
    @GetMapping("/stats")
    public ApiResponse<NotificationStatsResponse> getStats() {
        String userId = getCurrentUserId();
        NotificationStatsResponse stats = notificationService.getStats(userId);
        return ApiResponse.success(stats, "Statistics retrieved successfully");
    }

    /**
     * Đánh dấu một notification đã đọc
     */
    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable String id) {
        String userId = getCurrentUserId();
        NotificationResponse notification = notificationService.markAsRead(id, userId);
        return ApiResponse.success(notification, "Notification marked as read");
    }

    /**
     * Đánh dấu nhiều notifications đã đọc
     */
    @PutMapping("/read-multiple")
    public ApiResponse<Void> markMultipleAsRead(@RequestBody List<String> ids) {
        String userId = getCurrentUserId();
        notificationService.markMultipleAsRead(ids, userId);
        return ApiResponse.success(null, "Notifications marked as read");
    }

    /**
     * Đánh dấu tất cả đã đọc
     */
    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        String userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ApiResponse.success(null, "All notifications marked as read");
    }

    /**
     * Xóa một notification
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(@PathVariable String id) {
        String userId = getCurrentUserId();
        notificationService.deleteNotification(id, userId);
        return ApiResponse.success(null, "Notification deleted successfully");
    }

    /**
     * Xóa tất cả notifications đã đọc
     */
    @DeleteMapping("/read")
    public ApiResponse<Void> deleteAllRead() {
        String userId = getCurrentUserId();
        notificationService.deleteAllRead(userId);
        return ApiResponse.success(null, "All read notifications deleted");
    }

    /**
     * [INTERNAL] Tạo notification mới
     * API này chỉ dành cho internal services
     */
    @PostMapping("/internal/create")
    public ApiResponse<NotificationResponse> createNotification(
            @RequestBody CreateNotificationRequest request
    ) {
        NotificationResponse notification = notificationService.createNotification(request);
        return ApiResponse.success(notification, "Notification created successfully");
    }

    // Helper method
    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}