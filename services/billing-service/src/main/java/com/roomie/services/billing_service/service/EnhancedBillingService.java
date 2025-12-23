package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.internal.BillCalculation;
import com.roomie.services.billing_service.dto.internal.MeterReadings;
import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.dto.response.ContractResponse;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.entity.MeterReading;
import com.roomie.services.billing_service.entity.Utility;
import com.roomie.services.billing_service.enums.BillStatus;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.mapper.BillMapper;
import com.roomie.services.billing_service.repository.BillRepository;
import com.roomie.services.billing_service.repository.MeterReadingRepository;
import com.roomie.services.billing_service.repository.httpclient.ContractClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Enhanced Billing Service V2
 * Features:
 * - Auto-loads utility configuration
 * - Auto-inherits previous meter readings
 * - Tracks meter reading history
 * - Distinguishes between new bill and update existing bill
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EnhancedBillingService {

    BillRepository billRepository;
    MeterReadingRepository meterReadingRepository;
    BillMapper billMapper;
    ContractClient contractClient;
    UtilityService utilityService;
    BillValidationService validationService;
    BillCalculationService calculationService;
    KafkaTemplate<String, Object> kafkaTemplate;

    // ==================== CREATE WITH AUTO-LOAD ====================

    /**
     * Smart Bill Creation:
     * 1. Check if bill exists for the month
     * 2. Auto-load utility configuration
     * 3. Auto-inherit previous meter readings
     * 4. Guide user on what to input
     */
    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, allEntries = true)
    public BillResponse createOrUpdateBill(BillRequest request) {
        log.info("Creating/Updating bill for contract: {}", request.getContractId());

        // 1. Fetch and validate contract
        ContractResponse contract = fetchContractSafely(request.getContractId());

        // 2. Validate and parse billing month
        LocalDate billingMonth = validationService.validateAndParseBillingMonth(
                request.getBillingMonth()
        );

        // 3. Check if bill already exists
        Optional<Bill> existingBill = billRepository.findByContractIdAndBillingMonth(
                request.getContractId(), billingMonth
        );

        if (existingBill.isPresent()) {
            // UPDATE EXISTING BILL
            return updateExistingBill(existingBill.get(), request, contract);
        } else {
            // CREATE NEW BILL
            return createNewBill(request, contract, billingMonth);
        }
    }

    /**
     * Create new bill with auto-loaded data
     */
    private BillResponse createNewBill(
            BillRequest request,
            ContractResponse contract,
            LocalDate billingMonth
    ) {
        log.info("Creating NEW bill for month: {}", billingMonth);

        // 1. Load utility configuration
        Utility utility = utilityService.getUtilityForBilling(
                contract.getPropertyId(),
                contract.getId()
        );

        // 2. Auto-fill unit prices from utility config
        if (request.getElectricityUnitPrice() == null) {
            request.setElectricityUnitPrice(utility.getElectricityUnitPrice());
        }
        if (request.getWaterUnitPrice() == null) {
            request.setWaterUnitPrice(utility.getWaterUnitPrice());
        }
        if (request.getInternetPrice() == null) {
            request.setInternetPrice(utility.getInternetPrice() != null ?
                    utility.getInternetPrice() : null);
        }
        if (request.getParkingPrice() == null) {
            request.setParkingPrice(utility.getParkingPrice() != null ?
                    utility.getParkingPrice() : null);
        }
        if (request.getCleaningPrice() == null) {
            request.setCleaningPrice(utility.getCleaningPrice() != null ?
                    utility.getCleaningPrice() : null);
        }
        if (request.getMaintenancePrice() == null) {
            request.setMaintenancePrice(utility.getMaintenancePrice() != null ?
                    utility.getMaintenancePrice() : null);
        }

        // 3. Get previous meter readings (auto-inherit)
        MeterReadings previousReadings = getPreviousReadingsFromHistory(contract.getId());

        // 4. Validate new meter readings
        validationService.validateMeterReadings(request, previousReadings);

        // 5. Calculate amounts
        BillCalculation calculation = calculationService.calculate(request, previousReadings);

        // 6. Calculate due date
        LocalDate dueDate = calculationService.calculateDueDate(billingMonth);

        // 7. Build and save bill
        Bill bill = buildBill(request, contract, billingMonth, dueDate,
                previousReadings, calculation);

        Bill saved = billRepository.save(bill);

        // 8. Save meter reading history
        saveMeterReadingHistory(saved, previousReadings);

        log.info("NEW bill created successfully: {}", saved.getId());

        return billMapper.toResponse(saved);
    }

    /**
     * Update existing bill - only allow updating meter readings
     */
    private BillResponse updateExistingBill(
            Bill existingBill,
            BillRequest request,
            ContractResponse contract
    ) {
        log.info("UPDATING existing bill: {}", existingBill.getId());

        // Only allow updating if status is DRAFT
        if (existingBill.getStatus() != BillStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_BILL_STATUS,
                    "Can only update bills in DRAFT status");
        }

        // Get current readings as "previous"
        MeterReadings currentReadings = MeterReadings.builder()
                .electricityOld(existingBill.getElectricityOld())
                .waterOld(existingBill.getWaterOld())
                .build();

        // Validate new readings
        validationService.validateMeterReadings(request, currentReadings);

        // Recalculate amounts
        BillCalculation calculation = calculationService.calculate(request, currentReadings);

        // Update bill fields
        updateBillFields(existingBill, request, calculation);

        Bill saved = billRepository.save(existingBill);

        // Update meter reading history
        updateMeterReadingHistory(saved, currentReadings);

        log.info("Bill updated successfully: {}", existingBill.getId());

        return billMapper.toResponse(saved);
    }

    // ==================== METER READING HELPERS ====================

    /**
     * Get previous meter readings from history
     */
    private MeterReadings getPreviousReadingsFromHistory(String contractId) {
        Optional<MeterReading> lastReading = meterReadingRepository
                .findFirstByContractIdOrderByReadingMonthDesc(contractId);

        if (lastReading.isPresent()) {
            MeterReading reading = lastReading.get();
            return MeterReadings.builder()
                    .electricityOld(reading.getElectricityReading())
                    .waterOld(reading.getWaterReading())
                    .build();
        } else {
            // First bill - readings will be from request
            return MeterReadings.builder()
                    .electricityOld(0.0)
                    .waterOld(0.0)
                    .build();
        }
    }

    /**
     * Save meter reading to history
     */
    private void saveMeterReadingHistory(Bill bill, MeterReadings previousReadings) {
        MeterReading reading = MeterReading.builder()
                .propertyId(bill.getPropertyId())
                .contractId(bill.getContractId())
                .billId(bill.getId())
                .readingMonth(bill.getBillingMonth())
                .readingDate(LocalDate.now())
                .electricityReading(bill.getElectricityNew())
                .waterReading(bill.getWaterNew())
                .recordedBy(getCurrentUserId())
                .createdAt(Instant.now())
                .build();

        meterReadingRepository.save(reading);
        log.debug("Meter reading history saved for bill: {}", bill.getId());
    }

    /**
     * Update meter reading history
     */
    private void updateMeterReadingHistory(Bill bill, MeterReadings previousReadings) {
        Optional<MeterReading> existing = meterReadingRepository.findByBillId(bill.getId());

        if (existing.isPresent()) {
            MeterReading reading = existing.get();
            reading.setElectricityReading(bill.getElectricityNew());
            reading.setWaterReading(bill.getWaterNew());
            reading.setReadingDate(LocalDate.now());

            meterReadingRepository.save(reading);
            log.debug("Meter reading history updated for bill: {}", bill.getId());
        }
    }

    // ==================== STATE TRANSITIONS ====================

    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, key = "#billId")
    public BillResponse send(String billId) {
        log.info("Sending bill: {}", billId);

        Bill bill = getBillEntity(billId);
        validationService.validateStatusTransition(bill, BillStatus.DRAFT, "send");

        bill.setStatus(BillStatus.PENDING);
        bill.setUpdatedAt(Instant.now());

        Bill saved = billRepository.save(bill);

        // Publish event
        publishBillEvent("bill.sent", saved);

        log.info("Bill sent successfully: {}", billId);

        return billMapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, key = "#billId")
    public BillResponse pay(String billId, String paymentId) {
        log.info("Processing payment for bill: {}, paymentId: {}", billId, paymentId);

        Bill bill = getBillEntity(billId);
        validationService.validateStatusTransition(bill, BillStatus.PENDING, "pay");

        bill.setStatus(BillStatus.PAID);
        bill.setPaymentId(paymentId);
        bill.setPaidAt(Instant.now());
        bill.setUpdatedAt(Instant.now());

        Bill saved = billRepository.save(bill);

        // Publish event
        publishBillEvent("bill.paid", saved);

        log.info("Bill paid successfully: {}", billId);

        return billMapper.toResponse(saved);
    }

    // ==================== QUERIES ====================

    public BillResponse getBill(String id) {
        log.debug("Fetching bill: {}", id);
        return billMapper.toResponse(getBillEntity(id));
    }

    public List<BillResponse> getAll() {
        log.debug("Fetching all bills");
        return billRepository.findAll().stream()
                .map(billMapper::toResponse)
                .collect(Collectors.toList());
    }

//    @Cacheable(value = "bill_by_contract", key = "#contractId")
    public List<BillResponse> getByContract(String contractId) {
        log.debug("Fetching bills for contract: {}", contractId);
        return billRepository.findByContractId(contractId).stream()
                .map(billMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<BillResponse> getMyLandlordBills() {
        String userId = getCurrentUserId();
        log.debug("Fetching landlord bills for user: {}", userId);

        return billRepository.findByLandlordId(userId).stream()
                .map(billMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<BillResponse> getMyTenantBills() {
        String userId = getCurrentUserId();
        log.debug("Fetching tenant bills for user: {}", userId);

        return billRepository.findByTenantId(userId).stream()
                .map(billMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ==================== DELETE ====================

    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, allEntries = true)
    public void deleteBill(String id) {
        log.info("Deleting bill: {}", id);

        Bill bill = getBillEntity(id);

        // Only allow deleting DRAFT bills
        if (bill.getStatus() != BillStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_BILL_STATUS,
                    "Can only delete bills in DRAFT status");
        }

        // Delete associated meter reading
        meterReadingRepository.findByBillId(id).ifPresent(meterReadingRepository::delete);

        billRepository.deleteById(id);

        log.info("Bill deleted successfully: {}", id);
    }

    // ==================== SCHEDULED TASKS ====================

    @Scheduled(cron = "${billing.overdue-check-cron:0 0 3 * * *}")
    public void markOverdueBills() {
        log.info("Running scheduled task: markOverdueBills");

        LocalDate today = LocalDate.now();

        List<Bill> overdueBills = billRepository.findByStatusAndDueDateBefore(
                BillStatus.PENDING, today
        );

        if (overdueBills.isEmpty()) {
            log.info("No overdue bills found");
            return;
        }

        overdueBills.forEach(bill -> {
            bill.setStatus(BillStatus.OVERDUE);
            bill.setUpdatedAt(Instant.now());

            Bill saved = billRepository.save(bill);
            publishBillEvent("bill.overdue", saved);
        });

        log.info("Marked {} bills as OVERDUE", overdueBills.size());
    }

    // ==================== PRIVATE HELPERS ====================

    private ContractResponse fetchContractSafely(String contractId) {
        try {
            ResponseEntity<ApiResponse<ContractResponse>> response =
                    contractClient.get(contractId);

            if (response == null || response.getBody() == null) {
                throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
            }

            ApiResponse<ContractResponse> body = response.getBody();

            if (!body.isSuccess() || body.getResult() == null) {
                throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
            }

            return body.getResult();

        } catch (FeignException.NotFound ex) {
            log.error("Contract not found: {}", contractId);
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        } catch (FeignException ex) {
            log.error("Contract service error for contractId: {}", contractId, ex);
            throw new AppException(ErrorCode.CONTRACT_SERVICE_ERROR);
        }
    }

    private Bill buildBill(
            BillRequest request,
            ContractResponse contract,
            LocalDate billingMonth,
            LocalDate dueDate,
            MeterReadings previousReadings,
            BillCalculation calculation
    ) {
        return Bill.builder()
                // References
                .contractId(contract.getId())
                .propertyId(contract.getPropertyId())
                .landlordId(contract.getLandlordId())
                .tenantId(contract.getTenantId())

                // Billing period
                .billingMonth(billingMonth)
                .dueDate(dueDate)

                // Electricity
                .electricityOld(previousReadings.getElectricityOld())
                .electricityNew(request.getElectricityNew())
                .electricityConsumption(calculation.getElectricityConsumption())
                .electricityUnitPrice(request.getElectricityUnitPrice())
                .electricityAmount(calculation.getElectricityAmount())

                // Water
                .waterOld(previousReadings.getWaterOld())
                .waterNew(request.getWaterNew())
                .waterConsumption(calculation.getWaterConsumption())
                .waterUnitPrice(request.getWaterUnitPrice())
                .waterAmount(calculation.getWaterAmount())

                // Fixed costs
                .internetPrice(calculation.getInternetAmount())
                .parkingPrice(calculation.getParkingAmount())
                .cleaningPrice(calculation.getCleaningAmount())
                .maintenancePrice(calculation.getMaintenanceAmount())

                // Rent
                .monthlyRent(calculation.getMonthlyRentAmount())
                .rentalDeposit(calculation.getRentalDepositAmount())

                // Other
                .otherDescription(request.getOtherDescription())
                .otherPrice(calculation.getOtherAmount())

                // Total & Status
                .totalAmount(calculation.getTotalAmount())
                .status(BillStatus.DRAFT)

                // Notes
                .notes(request.getNotes())

                // Timestamps
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private void updateBillFields(
            Bill bill,
            BillRequest request,
            BillCalculation calculation
    ) {
        // Electricity
        bill.setElectricityNew(request.getElectricityNew());
        bill.setElectricityUnitPrice(request.getElectricityUnitPrice());
        bill.setElectricityConsumption(calculation.getElectricityConsumption());
        bill.setElectricityAmount(calculation.getElectricityAmount());

        // Water
        bill.setWaterNew(request.getWaterNew());
        bill.setWaterUnitPrice(request.getWaterUnitPrice());
        bill.setWaterConsumption(calculation.getWaterConsumption());
        bill.setWaterAmount(calculation.getWaterAmount());

        // Fixed costs
        bill.setInternetPrice(calculation.getInternetAmount());
        bill.setParkingPrice(calculation.getParkingAmount());
        bill.setCleaningPrice(calculation.getCleaningAmount());
        bill.setMaintenancePrice(calculation.getMaintenanceAmount());

        // Rent
        bill.setMonthlyRent(calculation.getMonthlyRentAmount());
        bill.setRentalDeposit(calculation.getRentalDepositAmount());

        // Other
        bill.setOtherDescription(request.getOtherDescription());
        bill.setOtherPrice(calculation.getOtherAmount());

        // Total
        bill.setTotalAmount(calculation.getTotalAmount());
        bill.setNotes(request.getNotes());
        bill.setUpdatedAt(Instant.now());
    }

    private Bill getBillEntity(String id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    private void publishBillEvent(String topic, Bill bill) {
        try {
            kafkaTemplate.send(topic, bill.getId());
            log.debug("Published event {} for bill {}", topic, bill.getId());
        } catch (Exception e) {
            log.error("Failed to publish event {} for bill {}", topic, bill.getId(), e);
        }
    }
}