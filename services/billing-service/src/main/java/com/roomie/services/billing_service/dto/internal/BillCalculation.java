package com.roomie.services.billing_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillCalculation {
    double electricityConsumption;
    double electricityAmount;
    double waterConsumption;
    double waterAmount;
    double totalAmount;
}
