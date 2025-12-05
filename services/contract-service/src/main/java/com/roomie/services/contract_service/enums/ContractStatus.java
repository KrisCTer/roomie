package com.roomie.services.contract_service.enums;

public enum ContractStatus {
    DRAFT,              // Bản nháp (preview PDF)
    PENDING_SIGNATURE,  // Chờ ký (1 hoặc cả 2 bên)
    PENDING_PAYMENT,    // Cả 2 đã ký, chờ thanh toán
    ACTIVE,             // Đã thanh toán, hợp đồng hiệu lực
    PAUSED,             // Tạm dừng
    TERMINATED,         // Chấm dứt
    EXPIRED,            // Hết hạn
    RENEWED             // Đã gia hạn
}
