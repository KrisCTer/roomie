package com.roomie.services.property_service.entity;

import com.roomie.services.property_service.enums.ApprovalStatus;
import com.roomie.services.property_service.enums.PropertyLabel;
import com.roomie.services.property_service.enums.PropertyStatus;
import com.roomie.services.property_service.enums.PropertyType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "properties")
public class Property {
    @MongoId
    String propertyId;

    String title;
    String description;

    Address address;

    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    PropertyType propertyType;       // e.g. "Phòng trọ", "Căn hộ"
    PropertyStatus propertyStatus;     // e.g. "Đang cho thuê", "Đã thuê"
    PropertyLabel propertyLabel;      // e.g. "Hot", "Mới đăng"

    Double size;               // Diện tích sử dụng

    Integer rooms;
    Integer bedrooms;
    Integer bathrooms;
    Integer garages;

    Amenities amenities;
    List<Media> mediaList;    // Ảnh / video

    Owner owner;               // Thông tin chủ sở hữu hoặc người đăng

    ApprovalStatus status;

    Instant createdAt;
    Instant updatedAt;
}
