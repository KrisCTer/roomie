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
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {
    NotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unreadOnly,
            @ModelAttribute NotificationFilterRequest filter) {
        String userId = getCurrentUserId();
        if (filter == null) {
            filter = new NotificationFilterRequest();
        }
        filter.setUnreadOnly(unreadOnly);
        return ApiResponse.success(notificationService.getUserNotifications(userId, page, size, filter), "Notifications retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse> getNotification(@PathVariable String id) {
        return ApiResponse.success(notificationService.getById(id, getCurrentUserId()), "Notification retrieved successfully");
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.success(notificationService.countUnread(getCurrentUserId()), "Unread count retrieved successfully");
    }

    @GetMapping("/stats")
    public ApiResponse<NotificationStatsResponse> getStats() {
        return ApiResponse.success(notificationService.getStats(getCurrentUserId()), "Statistics retrieved successfully");
    }

    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable String id) {
        return ApiResponse.success(notificationService.markAsRead(id, getCurrentUserId()), "Notification marked as read");
    }

    @PutMapping("/read-multiple")
    public ApiResponse<Void> markMultipleAsRead(@RequestBody List<String> ids) {
        notificationService.markMultipleAsRead(ids, getCurrentUserId());
        return ApiResponse.success(null, "Notifications marked as read");
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUserId());
        return ApiResponse.success(null, "All notifications marked as read");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id, getCurrentUserId());
        return ApiResponse.success(null, "Notification deleted successfully");
    }

    @DeleteMapping("/read")
    public ApiResponse<Void> deleteAllRead() {
        notificationService.deleteAllRead(getCurrentUserId());
        return ApiResponse.success(null, "All read notifications deleted");
    }

    @PostMapping("/internal/create")
    public ApiResponse<NotificationResponse> createNotification(@RequestBody CreateNotificationRequest request) {
        return ApiResponse.success(notificationService.createNotification(request), "Notification created successfully");
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}