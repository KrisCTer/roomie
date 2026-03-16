package com.roomie.services.contract_service.enums;

public enum BillStatus {
    DRAFT,      // Nháp (chưa gửi)
    PENDING,    // Đã gửi, chờ thanh toán
    PAID,       // Đã thanh toán
    OVERDUE     // Quá hạn
}
