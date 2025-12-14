package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.internal.BillCalculation;
import com.roomie.services.billing_service.dto.internal.MeterReadings;
import com.roomie.services.billing_service.dto.request.BillRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BillCalculationService {

    /**
     * Calculate all bill amounts
     */
    public BillCalculation calculate(BillRequest request, MeterReadings previousReadings) {
        log.debug("Calculating bill amounts for contract: {}", request.getContractId());
        return BillCalculation.calculate(request, previousReadings);
    }

    /**
     * Calculate due date
     */
    public LocalDate calculateDueDate(LocalDate billingMonth) {
        // Due on the 5th of next month
        return billingMonth.plusMonths(1).withDayOfMonth(5);
    }

    /**
     * Calculate late fee
     */
    public Double calculateLateFee(LocalDate dueDate, Double totalAmount) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(dueDate) || today.isEqual(dueDate)) {
            return 0.0;
        }

        long daysLate = java.time.temporal.ChronoUnit.DAYS.between(dueDate, today);

        // 1% per day late, max 20%
        double lateFeeRate = Math.min(daysLate * 0.01, 0.20);

        return totalAmount * lateFeeRate;
    }
}