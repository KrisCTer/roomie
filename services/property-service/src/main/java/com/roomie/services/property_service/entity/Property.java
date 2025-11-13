package com.roomie.services.property_service.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    BigDecimal price;
    String priceLabel;
    BigDecimal rentalDeposit;

    String propertyType;       // e.g. "Phòng trọ", "Căn hộ"
    String propertyStatus;     // e.g. "Đang cho thuê", "Đã thuê"
    String propertyLabel;      // e.g. "Hot", "Mới đăng"

    Double size;               // Diện tích sử dụng
    Double landArea;           // Diện tích đất (optional)

    Integer rooms;
    Integer bedrooms;
    Integer bathrooms;
    Integer garages;

    Integer yearBuilt;

    Amenities amenities;
//    @JsonProperty("mediaList")
    List<Media> mediaList;    // Ảnh / video
    VirtualTour virtualTour;
    List<Floor> floors;

    Owner owner;               // Thông tin chủ sở hữu hoặc người đăng

    Instant createdAt;
    Instant updatedAt;
}
