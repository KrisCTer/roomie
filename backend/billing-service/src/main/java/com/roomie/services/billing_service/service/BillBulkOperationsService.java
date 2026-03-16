package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.enums.BillStatus;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.repository.BillRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Bill Bulk Operations Service
 * Handles bulk bill generation and sending
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BillBulkOperationsService {

    EnhancedBillingService billingService;
    BillRepository billRepository;
    ExecutorService executorService = Executors.newFixedThreadPool(10);

    /**
     * Bulk generate bills
     * Processes multiple bill requests in parallel
     */
    @Transactional
    public Map<String, Object> bulkGenerateBills(List<BillRequest> requests) {
        log.info("Starting bulk generation for {} bills", requests.size());

        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> successList = new ArrayList<>();
        List<Map<String, Object>> failedList = new ArrayList<>();

        // Process in parallel
        List<CompletableFuture<Map<String, Object>>> futures = requests.stream()
                .map(request -> CompletableFuture.supplyAsync(() -> {
                    try {
                        BillResponse bill = billingService.createOrUpdateBill(request);

                        Map<String, Object> success = new HashMap<>();
                        success.put("contractId", request.getContractId());
                        success.put("billingMonth", request.getBillingMonth());
                        success.put("billId", bill.getId());
                        success.put("status", "success");

                        return success;
                    } catch (Exception e) {
                        log.error("Error generating bill for contract: {}",
                                request.getContractId(), e);

                        Map<String, Object> failed = new HashMap<>();
                        failed.put("contractId", request.getContractId());
                        failed.put("billingMonth", request.getBillingMonth());
                        failed.put("status", "failed");
                        failed.put("error", e.getMessage());

                        return failed;
                    }
                }, executorService))
                .collect(Collectors.toList());

        // Wait for all to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        // Collect results
        futures.forEach(future -> {
            try {
                Map<String, Object> item = future.get();
                if ("success".equals(item.get("status"))) {
                    successList.add(item);
                } else {
                    failedList.add(item);
                }
            } catch (Exception e) {
                log.error("Error collecting result", e);
            }
        });

        result.put("total", requests.size());
        result.put("successCount", successList.size());
        result.put("failedCount", failedList.size());
        result.put("successList", successList);
        result.put("failedList", failedList);

        log.info("Bulk generation completed: {} success, {} failed",
                successList.size(), failedList.size());

        return result;
    }

    /**
     * Bulk send bills
     * Changes status from DRAFT to PENDING for multiple bills
     */
    @Transactional
    public Map<String, Object> bulkSendBills(List<String> billIds) {
        log.info("Starting bulk send for {} bills", billIds.size());

        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> successList = new ArrayList<>();
        List<Map<String, Object>> failedList = new ArrayList<>();

        for (String billId : billIds) {
            try {
                Bill bill = billRepository.findById(billId)
                        .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

                // Validate status
                if (bill.getStatus() != BillStatus.DRAFT) {
                    throw new IllegalStateException(
                            "Can only send bills in DRAFT status. Current: " + bill.getStatus());
                }

                // Change status
                bill.setStatus(BillStatus.PENDING);
                bill.setUpdatedAt(Instant.now());
                billRepository.save(bill);

                Map<String, Object> success = new HashMap<>();
                success.put("billId", billId);
                success.put("status", "success");
                success.put("contractId", bill.getContractId());
                success.put("billingMonth", bill.getBillingMonth());

                successList.add(success);

                log.debug("Bill sent successfully: {}", billId);

            } catch (Exception e) {
                log.error("Error sending bill: {}", billId, e);

                Map<String, Object> failed = new HashMap<>();
                failed.put("billId", billId);
                failed.put("status", "failed");
                failed.put("error", e.getMessage());

                failedList.add(failed);
            }
        }

        result.put("total", billIds.size());
        result.put("successCount", successList.size());
        result.put("failedCount", failedList.size());
        result.put("successList", successList);
        result.put("failedList", failedList);

        log.info("Bulk send completed: {} success, {} failed",
                successList.size(), failedList.size());

        return result;
    }

    /**
     * Validate bills for bulk operations
     */
    private void validateBillForSend(Bill bill) {
        if (bill.getStatus() != BillStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_BILL_STATUS,
                    "Can only send bills in DRAFT status");
        }

        if (bill.getTotalAmount() == null || bill.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Bill must have a positive total amount");
        }
    }
}