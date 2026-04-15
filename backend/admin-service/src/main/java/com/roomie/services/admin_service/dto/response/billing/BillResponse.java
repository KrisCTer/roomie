package com.roomie.services.admin_service.dto.response.billing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class BillResponse {
    String id;
    String contractId;
    BigDecimal monthlyRent;
    BigDecimal electricityAmount;
    BigDecimal waterAmount;
    BigDecimal internetPrice;
    BigDecimal parkingPrice;
    BigDecimal cleaningPrice;
    BigDecimal maintenancePrice;
    BigDecimal otherPrice;
    BigDecimal totalAmount;
    LocalDate billingMonth;
    LocalDate dueDate;
    String status;
    String notes;
    Instant createdAt;
    Instant updatedAt;
}
