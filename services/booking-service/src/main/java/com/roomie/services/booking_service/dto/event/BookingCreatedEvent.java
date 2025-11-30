package com.roomie.services.booking_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreatedEvent {
    String bookingId;
    String tenantId;
    String propertyId;
    Double amount;
}
