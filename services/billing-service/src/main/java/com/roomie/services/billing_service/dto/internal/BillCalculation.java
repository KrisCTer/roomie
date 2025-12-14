package com.roomie.services.billing_service.dto.internal;

import com.roomie.services.billing_service.dto.request.BillRequest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillCalculation {
    // Electricity
    double electricityConsumption;
    BigDecimal electricityAmount;

    // Water
    double waterConsumption;
    BigDecimal waterAmount;

    // Fixed costs
    BigDecimal internetAmount;
    BigDecimal parkingAmount;
    BigDecimal cleaningAmount;
    BigDecimal maintenanceAmount;
    BigDecimal otherAmount;

    // Rent
    BigDecimal monthlyRentAmount;
    BigDecimal rentalDepositAmount;

    // Total
    BigDecimal totalAmount;

    public static BillCalculation calculate(
            BillRequest request,
            MeterReadings previousReadings
    ) {
        // Electricity
        double electricityConsumption =
                request.getElectricityNew() - previousReadings.getElectricityOld();
        BigDecimal electricityAmount = BigDecimal.valueOf(electricityConsumption)
                .multiply(BigDecimal.valueOf(request.getElectricityUnitPrice()));

        // Water
        double waterConsumption =
                request.getWaterNew() - previousReadings.getWaterOld();
        BigDecimal waterAmount = BigDecimal.valueOf(waterConsumption)
                .multiply(BigDecimal.valueOf(request.getWaterUnitPrice()));

        // Fixed costs
        BigDecimal internetAmount = safeBigDecimal(request.getInternetPrice());
        BigDecimal parkingAmount = safeBigDecimal(request.getParkingPrice());
        BigDecimal cleaningAmount = safeBigDecimal(request.getCleaningPrice());
        BigDecimal maintenanceAmount = safeBigDecimal(request.getMaintenancePrice());
        BigDecimal otherAmount = safeBigDecimal(request.getOtherPrice());

        // Rent
        BigDecimal monthlyRentAmount = safeBigDecimal(request.getMonthlyRent());
        BigDecimal rentalDepositAmount = safeBigDecimal(request.getRentalDeposit());

        // Total
        BigDecimal totalAmount = electricityAmount
                .add(waterAmount)
                .add(internetAmount)
                .add(parkingAmount)
                .add(cleaningAmount)
                .add(maintenanceAmount)
                .add(otherAmount)
                .add(monthlyRentAmount)
                .add(rentalDepositAmount);

        return BillCalculation.builder()
                .electricityConsumption(electricityConsumption)
                .electricityAmount(electricityAmount)
                .waterConsumption(waterConsumption)
                .waterAmount(waterAmount)
                .internetAmount(internetAmount)
                .parkingAmount(parkingAmount)
                .cleaningAmount(cleaningAmount)
                .maintenanceAmount(maintenanceAmount)
                .otherAmount(otherAmount)
                .monthlyRentAmount(monthlyRentAmount)
                .rentalDepositAmount(rentalDepositAmount)
                .totalAmount(totalAmount)
                .build();
    }

    private static BigDecimal safeBigDecimal(Double value) {
        return value != null ? BigDecimal.valueOf(value) : BigDecimal.ZERO;
    }

    private static BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}