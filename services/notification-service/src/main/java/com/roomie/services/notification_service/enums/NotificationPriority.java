package com.roomie.services.notification_service.enums;

public enum NotificationPriority {
    LOW,        // Thông báo bình thường
    NORMAL,     // Mức độ trung bình
    HIGH,       // Quan trọng
    URGENT      // Khẩn cấp (payment overdue, contract expiring...)
}