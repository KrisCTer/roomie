package com.roomie.services.notification_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingEvent {
    String bookingId;
    String propertyId;
    String propertyTitle;
    String tenantId;
    String tenantName;
    String landlordId;
    String landlordName;
    Instant checkInDate;
    Instant checkOutDate;
    BigDecimal totalPrice;
    String status;
}