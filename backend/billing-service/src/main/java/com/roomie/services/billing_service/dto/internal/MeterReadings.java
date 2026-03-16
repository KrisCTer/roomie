package com.roomie.services.billing_service.dto.internal;

import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.entity.Bill;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterReadings {
    Double electricityOld;
    Double waterOld;

    public static MeterReadings fromPreviousBill(Bill previousBill) {
        return MeterReadings.builder()
                .electricityOld(previousBill.getElectricityNew())
                .waterOld(previousBill.getWaterNew())
                .build();
    }

    public static MeterReadings fromRequest(BillRequest request) {
        return MeterReadings.builder()
                .electricityOld(request.getElectricityOld())
                .waterOld(request.getWaterOld())
                .build();
    }
}
