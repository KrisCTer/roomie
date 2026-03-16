package com.roomie.services.booking_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    @NotNull
    String propertyId;

    BigDecimal monthlyRent;
    BigDecimal rentalDeposit;

    Instant leaseStart;
    Instant leaseEnd;
}
