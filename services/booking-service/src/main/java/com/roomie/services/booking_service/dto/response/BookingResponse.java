package com.roomie.services.booking_service.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    String id;
    String propertyId;
    String landlordId;
    String tenantId;
    Instant leaseStart;
    Instant leaseEnd;
    Double monthlyRent;
    Double rentalDeposit;
    String status;
    String bookingReference;
}
