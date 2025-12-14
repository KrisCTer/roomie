package com.roomie.services.contract_service.enums;

public enum PropertyType {
    // 1. Phân khúc bình dân/Sinh viên (Quan trọng nhất cho Roomie)
    ROOM,           // Phòng trọ / Nhà trọ
    DORMITORY,      // Ký túc xá / Sleepbox / Giường tầng

    // 2. Phân khúc căn hộ
    APARTMENT,      // Căn hộ chung cư (1PN, 2PN...)
    STUDIO,         // Căn hộ Studio (Không ngăn vách)
    OFFICETEL,      // Căn hộ văn phòng (Vừa ở vừa làm)

    // 3. Phân khúc nhà đất/Cao cấp
    HOUSE,          // Nhà nguyên căn / Nhà phố
    VILLA,          // Biệt thự

    OTHER           // Loại khác
}
