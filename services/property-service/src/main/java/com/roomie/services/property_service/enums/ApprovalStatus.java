package com.roomie.services.property_service.enums;

public enum ApprovalStatus {
    DRAFT,      // Nháp, chưa gửi duyệt
    PENDING,    // Đang chờ chủ admin duyệt
    ACTIVE,     // Đang hiệu lực, hợp đồng/lease được kích hoạt
    REJECTED    // Bị từ chối
}