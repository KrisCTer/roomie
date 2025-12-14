package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.internal.MeterReadings;
import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.enums.BillStatus;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.repository.BillRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class BillValidationService {

    final BillRepository billRepository;

    @Value("${billing.validation.max-electricity-consumption:10000}")
    double maxElectricityConsumption;

    @Value("${billing.validation.max-water-consumption:1000}")
    double maxWaterConsumption;

    /**
     * Validate billing month format
     */
    public LocalDate validateAndParseBillingMonth(String billingMonth) {
        if (billingMonth == null || billingMonth.isBlank()) {
            throw new AppException(ErrorCode.BILLING_MONTH_REQUIRED);
        }

        try {
            return LocalDate.parse(billingMonth + "-01");
        } catch (Exception e) {
            log.error("Invalid billing month format: {}", billingMonth, e);
            throw new AppException(ErrorCode.BILLING_MONTH_INVALID,
                    "Expected format: YYYY-MM");
        }
    }

    /**
     * Check for duplicate bill
     */
    public void validateNoDuplicateBill(String contractId, LocalDate billingMonth) {
        billRepository.findByContractIdAndBillingMonth(contractId, billingMonth)
                .ifPresent(existing -> {
                    throw new AppException(ErrorCode.BILL_ALREADY_EXISTS,
                            String.format("Bill already exists for contract %s in month %s",
                                    contractId, billingMonth));
                });
    }

    /**
     * Validate meter readings
     */
    public void validateMeterReadings(BillRequest request, MeterReadings previous) {
        validateElectricityReading(request.getElectricityNew(), previous.getElectricityOld());
        validateWaterReading(request.getWaterNew(), previous.getWaterOld());
    }

    private void validateElectricityReading(Double newReading, Double oldReading) {
        if (newReading == null) {
            throw new AppException(ErrorCode.INVALID_METER_READING,
                    "Electricity new reading is required");
        }

        if (newReading < oldReading) {
            throw new AppException(ErrorCode.INVALID_METER_READING,
                    String.format("Electricity reading cannot decrease (old: %.2f, new: %.2f)",
                            oldReading, newReading));
        }

        double consumption = newReading - oldReading;
        if (consumption > maxElectricityConsumption) {
            log.warn("Unusually high electricity consumption: {} kWh", consumption);
            throw new AppException(ErrorCode.INVALID_METER_READING,
                    String.format("Electricity consumption (%.2f kWh) exceeds maximum allowed (%.2f kWh)",
                            consumption, maxElectricityConsumption));
        }
    }

    private void validateWaterReading(Double newReading, Double oldReading) {
        if (newReading == null) {
            throw new AppException(ErrorCode.INVALID_METER_READING,
                    "Water new reading is required");
        }

        if (newReading < oldReading) {
            throw new AppException(ErrorCode.INVALID_METER_READING,
                    String.format("Water reading cannot decrease (old: %.2f, new: %.2f)",
                            oldReading, newReading));
        }

        double consumption = newReading - oldReading;
        if (consumption > maxWaterConsumption) {
            log.warn("Unusually high water consumption: {} m³", consumption);
            throw new AppException(ErrorCode.INVALID_METER_READING,
                    String.format("Water consumption (%.2f m³) exceeds maximum allowed (%.2f m³)",
                            consumption, maxWaterConsumption));
        }
    }

    /**
     * Validate bill status transition
     */
    public void validateStatusTransition(
            Bill bill,
            BillStatus requiredStatus,
            String action
    ) {
        if (bill.getStatus() != requiredStatus) {
            throw new AppException(ErrorCode.INVALID_BILL_STATUS,
                    String.format("Cannot %s bill in status %s. Required status: %s",
                            action, bill.getStatus(), requiredStatus));
        }
    }

    /**
     * Validate first bill requirements
     */
    public void validateFirstBillReadings(BillRequest request) {
        if (request.getElectricityOld() == null || request.getWaterOld() == null) {
            throw new AppException(ErrorCode.FIRST_BILL_MISSING_OLD_VALUES,
                    "First bill must include initial meter readings");
        }
    }
}