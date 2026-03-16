package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.enums.BillStatus;
import com.roomie.services.billing_service.repository.BillRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Bill Statistics Service
 * Provides statistical data for landlords and tenants
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BillStatisticsService {

    BillRepository billRepository;

    /**
     * Get landlord statistics
     */
    public Map<String, Object> getLandlordStatistics() {
        String landlordId = getCurrentUserId();
        log.debug("Calculating statistics for landlord: {}", landlordId);

        List<Bill> bills = billRepository.findByLandlordId(landlordId);

        Map<String, Object> stats = new HashMap<>();

        // Count by status
        stats.put("total", bills.size());
        stats.put("draft", countByStatus(bills, BillStatus.DRAFT));
        stats.put("pending", countByStatus(bills, BillStatus.PENDING));
        stats.put("paid", countByStatus(bills, BillStatus.PAID));
        stats.put("overdue", countByStatus(bills, BillStatus.OVERDUE));

        // Financial stats
        BigDecimal totalRevenue = bills.stream()
                .filter(b -> b.getStatus() == BillStatus.PAID)
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingAmount = bills.stream()
                .filter(b -> b.getStatus() == BillStatus.PENDING || b.getStatus() == BillStatus.OVERDUE)
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalRevenue", totalRevenue);
        stats.put("outstandingAmount", outstandingAmount);
        stats.put("totalAmount", totalRevenue.add(outstandingAmount));

        // Average bill amount
        double avgBillAmount = bills.isEmpty() ? 0 :
                bills.stream()
                        .map(Bill::getTotalAmount)
                        .mapToDouble(BigDecimal::doubleValue)
                        .average()
                        .orElse(0.0);
        stats.put("avgBillAmount", avgBillAmount);

        // Payment rate
        long totalBillsSent = countByStatus(bills, BillStatus.PENDING) +
                countByStatus(bills, BillStatus.PAID) +
                countByStatus(bills, BillStatus.OVERDUE);
        double paymentRate = totalBillsSent == 0 ? 0 :
                (double) countByStatus(bills, BillStatus.PAID) / totalBillsSent * 100;
        stats.put("paymentRate", paymentRate);

        // Monthly revenue chart (last 12 months)
        stats.put("monthlyRevenue", getMonthlyRevenue(bills));

        // Recent bills
        List<Map<String, Object>> recentBills = bills.stream()
                .sorted(Comparator.comparing(Bill::getCreatedAt).reversed())
                .limit(5)
                .map(this::billToMap)
                .collect(Collectors.toList());
        stats.put("recentBills", recentBills);

        return stats;
    }

    /**
     * Get tenant statistics
     */
    public Map<String, Object> getTenantStatistics() {
        String tenantId = getCurrentUserId();
        log.debug("Calculating statistics for tenant: {}", tenantId);

        List<Bill> bills = billRepository.findByTenantId(tenantId);

        Map<String, Object> stats = new HashMap<>();

        // Count by status
        stats.put("total", bills.size());
        stats.put("pending", countByStatus(bills, BillStatus.PENDING));
        stats.put("paid", countByStatus(bills, BillStatus.PAID));
        stats.put("overdue", countByStatus(bills, BillStatus.OVERDUE));

        // Financial stats
        BigDecimal totalPaid = bills.stream()
                .filter(b -> b.getStatus() == BillStatus.PAID)
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = bills.stream()
                .filter(b -> b.getStatus() == BillStatus.PENDING || b.getStatus() == BillStatus.OVERDUE)
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalPaid", totalPaid);
        stats.put("totalPending", totalPending);

        // Average bill amount
        double avgBillAmount = bills.isEmpty() ? 0 :
                bills.stream()
                        .map(Bill::getTotalAmount)
                        .mapToDouble(BigDecimal::doubleValue)
                        .average()
                        .orElse(0.0);
        stats.put("avgBillAmount", avgBillAmount);

        // Payment history (last 12 months)
        stats.put("paymentHistory", getPaymentHistory(bills));

        // Upcoming payments (next 3 months)
        List<Map<String, Object>> upcomingPayments = bills.stream()
                .filter(b -> b.getStatus() == BillStatus.PENDING || b.getStatus() == BillStatus.OVERDUE)
                .sorted(Comparator.comparing(Bill::getDueDate))
                .limit(5)
                .map(this::billToMap)
                .collect(Collectors.toList());
        stats.put("upcomingPayments", upcomingPayments);

        return stats;
    }

    // ==================== HELPER METHODS ====================

    private long countByStatus(List<Bill> bills, BillStatus status) {
        return bills.stream()
                .filter(b -> b.getStatus() == status)
                .count();
    }

    private List<Map<String, Object>> getMonthlyRevenue(List<Bill> bills) {
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> monthlyData = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String monthLabel = month.format(java.time.format.DateTimeFormatter.ofPattern("MMM yyyy"));

            BigDecimal revenue = bills.stream()
                    .filter(b -> b.getStatus() == BillStatus.PAID)
                    .filter(b -> b.getBillingMonth().getYear() == month.getYear() &&
                            b.getBillingMonth().getMonth() == month.getMonth())
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> data = new HashMap<>();
            data.put("month", monthLabel);
            data.put("revenue", revenue);
            monthlyData.add(data);
        }

        return monthlyData;
    }

    private List<Map<String, Object>> getPaymentHistory(List<Bill> bills) {
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> history = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String monthLabel = month.format(java.time.format.DateTimeFormatter.ofPattern("MMM yyyy"));

            BigDecimal amount = bills.stream()
                    .filter(b -> b.getStatus() == BillStatus.PAID)
                    .filter(b -> b.getBillingMonth().getYear() == month.getYear() &&
                            b.getBillingMonth().getMonth() == month.getMonth())
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> data = new HashMap<>();
            data.put("month", monthLabel);
            data.put("amount", amount);
            history.add(data);
        }

        return history;
    }

    private Map<String, Object> billToMap(Bill bill) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", bill.getId());
        map.put("billingMonth", bill.getBillingMonth());
        map.put("dueDate", bill.getDueDate());
        map.put("totalAmount", bill.getTotalAmount());
        map.put("status", bill.getStatus());
        map.put("createdAt", bill.getCreatedAt());
        return map;
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }
}