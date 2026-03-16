package com.roomie.services.payment_service.dto.response;

import com.roomie.services.payment_service.enums.ContractStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractResponse {
    String id;
    String bookingId;
    String propertyId;
    String tenantId;
    String landlordId;
    Instant startDate;
    Instant endDate;
    ContractStatus status;
    boolean tenantSigned;
    boolean landlordSigned;
    String pdfUrl;
    Instant createdAt;
    Instant updatedAt;
}
