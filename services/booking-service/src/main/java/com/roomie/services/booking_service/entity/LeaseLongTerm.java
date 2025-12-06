package com.roomie.services.booking_service.entity;

import com.roomie.services.booking_service.enums.LeaseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "booking_long_term")
public class LeaseLongTerm {
    @MongoId
    String id;

    String propertyId;
    String landLordId;
    String tenantId;

    Instant leaseStart;
    Instant leaseEnd;

    Double monthlyRent;
    Double rentalDeposit;

    LeaseStatus status =  LeaseStatus.PENDING_APPROVAL;

    String bookingReference;

    @CreatedDate
    Instant createdAt;
    Instant updatedAt;
}
