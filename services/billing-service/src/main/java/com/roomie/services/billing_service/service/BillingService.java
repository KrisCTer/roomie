package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.internal.BillCalculation;
import com.roomie.services.billing_service.dto.internal.MeterReadings;
import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.dto.response.ContractResponse;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.enums.BillStatus;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.mapper.BillMapper;
import com.roomie.services.billing_service.repository.BillRepository;
import com.roomie.services.billing_service.repository.httpclient.ContractClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
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

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BillingService {

    BillRepository billRepository;
    BillMapper billMapper;
    ContractClient contractClient;
    BillValidationService validationService;
    BillCalculationService calculationService;
    KafkaTemplate<String, Object> kafkaTemplate;

    // ==================== CREATE ====================

    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, allEntries = true)
    public BillResponse createBill(BillRequest request) {
        log.info("Creating bill for contract: {}", request.getContractId());

        // 1. Fetch and validate contract
        ContractResponse contract = fetchContractSafely(request.getContractId());

        // 2. Validate and parse billing month
        LocalDate billingMonth = validationService.validateAndParseBillingMonth(
                request.getBillingMonth()
        );

        // 3. Check for duplicate
        validationService.validateNoDuplicateBill(request.getContractId(), billingMonth);

        // 4. Get previous meter readings
        MeterReadings previousReadings = getPreviousReadings(request, contract.getId());

        // 5. Validate meter readings
        validationService.validateMeterReadings(request, previousReadings);

        // 6. Calculate amounts
        BillCalculation calculation = calculationService.calculate(request, previousReadings);

        // 7. Calculate due date
        LocalDate dueDate = calculationService.calculateDueDate(billingMonth);

        // 8. Build and save bill
        Bill bill = buildBill(request, contract, billingMonth, dueDate,
                previousReadings, calculation);

        Bill saved = billRepository.save(bill);

        log.info("Bill created successfully: {}", saved.getId());

        return billMapper.toResponse(saved);
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

    @Cacheable(value = "bill", key = "#id")
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

    @Cacheable(value = "bill_by_contract", key = "#contractId")
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

    // ==================== UPDATE ====================

    @Transactional
    @CachePut(value = "bill", key = "#id")
    @CacheEvict(value = "bill_by_contract", allEntries = true)
    public BillResponse updateBill(String id, BillRequest request) {
        log.info("Updating bill: {}", id);

        Bill bill = getBillEntity(id);

        // Get current meter readings as "previous"
        MeterReadings currentReadings = MeterReadings.builder()
                .electricityOld(bill.getElectricityOld())
                .waterOld(bill.getWaterOld())
                .build();

        // Validate new readings
        validationService.validateMeterReadings(request, currentReadings);

        // Recalculate amounts
        BillCalculation calculation = calculationService.calculate(request, currentReadings);

        // Update bill fields
        updateBillFields(bill, request, calculation);

        Bill saved = billRepository.save(bill);

        log.info("Bill updated successfully: {}", id);

        return billMapper.toResponse(saved);
    }

    // ==================== DELETE ====================

    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, allEntries = true)
    public void deleteBill(String id) {
        log.info("Deleting bill: {}", id);

        if (!billRepository.existsById(id)) {
            throw new AppException(ErrorCode.BILL_NOT_FOUND);
        }

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

    private MeterReadings getPreviousReadings(BillRequest request, String contractId) {
        Optional<Bill> previousBill = billRepository
                .findFirstByContractIdOrderByCreatedAtDesc(contractId);

        if (previousBill.isPresent()) {
            return MeterReadings.fromPreviousBill(previousBill.get());
        } else {
            // First bill - validate required fields
            validationService.validateFirstBillReadings(request);
            return MeterReadings.fromRequest(request);
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
            // TODO: Create proper event DTOs
            kafkaTemplate.send(topic, bill.getId());
            log.debug("Published event {} for bill {}", topic, bill.getId());
        } catch (Exception e) {
            log.error("Failed to publish event {} for bill {}", topic, bill.getId(), e);
            // Don't fail the main operation
        }
    }
}