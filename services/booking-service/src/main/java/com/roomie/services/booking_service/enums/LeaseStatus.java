package com.roomie.services.booking_service.enums;

public enum LeaseStatus {
    PENDING_APPROVAL,  // Chờ duyệt hợp đồng
    ACTIVE,            // Đang hiệu lực
    PAUSED,            // Tạm dừng
    TERMINATED,        // Chấm dứt trước hạn
    EXPIRED,           // Hết hạn tự nhiên
    RENEWED            // Đã gia hạn
}
