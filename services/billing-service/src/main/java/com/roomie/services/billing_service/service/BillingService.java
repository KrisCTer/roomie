package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.request.BillRequest;
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
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class BillingService {
    BillRepository billRepository;
    BillMapper billMapper;
    ContractClient contractClient;

    @Transactional
    @CacheEvict(value = {"bill", "bill_by_contract"}, allEntries = true)
    public BillResponse createBill(BillRequest req) {

        // ============================
        // 0. Parse billingMonth
        // ============================
        ResponseEntity<ContractResponse> contractResp;
        try {
            contractResp = contractClient.get(req.getContractId());
        } catch (FeignException.NotFound ex) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        } catch (FeignException ex) {
            throw new AppException(ErrorCode.CONTRACT_SERVICE_ERROR);
        }

        if (contractResp == null || contractResp.getBody() == null) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        }

        if (req.getBillingMonth() == null) {
            throw new AppException(ErrorCode.BILLING_MONTH_REQUIRED);
        }

        LocalDate billMonth;
        try {
            billMonth = LocalDate.parse(req.getBillingMonth() + "-01");
        } catch (Exception e) {
            throw new AppException(ErrorCode.BILLING_MONTH_INVALID);
        }

        // ============================
        // 1. Check duplicate bill
        // ============================
        Optional<Bill> existing = billRepository
                .findByContractIdAndBillingMonth(req.getContractId(), billMonth);

        if (existing.isPresent()) {
            throw new AppException(ErrorCode.BILL_ALREADY_EXISTS);
        }

        // ============================
        // 2. Lấy bill tháng trước
        // ============================
        Optional<Bill> prevBill = billRepository
                .findFirstByContractIdOrderByCreatedAtDesc(req.getContractId());

        Double electricityOld;
        Double waterOld;

        if (prevBill.isPresent()) {
            electricityOld = prevBill.get().getElectricityNew();
            waterOld = prevBill.get().getWaterNew();
        } else {
            if (req.getElectricityOld() == null || req.getWaterOld() == null) {
                throw new AppException(ErrorCode.FIRST_BILL_MISSING_OLD_VALUES);
            }
            electricityOld = req.getElectricityOld();
            waterOld = req.getWaterOld();
        }

        // ============================
        // 3. Tính consumption
        // ============================
        double electricityConsumption = req.getElectricityNew() - electricityOld;
        double electricityAmount = electricityConsumption * req.getElectricityUnitPrice();

        double waterConsumption = req.getWaterNew() - waterOld;
        double waterAmount = waterConsumption * req.getWaterUnitPrice();

        // ============================
        // 4. Total
        // ============================
        double total = electricityAmount + waterAmount
                + (req.getInternetPrice() != null ? req.getInternetPrice() : 0)
                + (req.getParkingPrice() != null ? req.getParkingPrice() : 0)
                + (req.getCleaningPrice() != null ? req.getCleaningPrice() : 0)
                + (req.getMaintenancePrice() != null ? req.getMaintenancePrice() : 0)
                + (req.getOtherPrice() != null ? req.getOtherPrice() : 0)
                + (req.getRentPrice() != null ? req.getRentPrice() : 0);

        // ============================
        // 5. Lưu bill
        // ============================
        Bill bill = Bill.builder()
                .contractId(req.getContractId())
                .billingMonth(billMonth)
                .dueDate(billMonth.plusMonths(1).withDayOfMonth(5)) // ví dụ hạn 5 của tháng kế tiếp

                .electricityOld(electricityOld)
                .electricityNew(req.getElectricityNew())
                .electricityConsumption(electricityConsumption)
                .electricityUnitPrice(req.getElectricityUnitPrice())
                .electricityAmount(electricityAmount)

                .waterOld(waterOld)
                .waterNew(req.getWaterNew())
                .waterConsumption(waterConsumption)
                .waterUnitPrice(req.getWaterUnitPrice())
                .waterAmount(waterAmount)

                .internetPrice(req.getInternetPrice())
                .parkingPrice(req.getParkingPrice())
                .cleaningPrice(req.getCleaningPrice())
                .maintenancePrice(req.getMaintenancePrice())

                .otherPrice(req.getOtherPrice())
                .otherDescription(req.getOtherDescription())

                .rentPrice(req.getRentPrice())
                .totalAmount(total)
                .status(BillStatus.PENDING)

                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return billMapper.toResponse(billRepository.save(bill));
    }

    @Cacheable(value = "bill", key = "#id")
    public BillResponse getBill(String id) {
        return billMapper.toResponse(
                billRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND))
        );
    }

    public List<BillResponse> getAll() {
        return billRepository.findAll().stream()
                .map(billMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "bill_by_contract", key = "#contractId")
    public List<BillResponse> getByContract(String contractId) {
        return billRepository.findByContractId(contractId).stream()
                .map(billMapper::toResponse)
                .toList();
    }

    @CachePut(value = "bill", key = "#id")
    public BillResponse updateBill(String id, BillRequest req) {

        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        // BILL THÁNG TRƯỚC LUÔN LÀ bill hiện tại → old không đổi
        Double electricityOld = bill.getElectricityOld();
        Double waterOld = bill.getWaterOld();

        // UPDATE NEW VALUES
        bill.setElectricityNew(req.getElectricityNew());
        bill.setElectricityUnitPrice(req.getElectricityUnitPrice());

        bill.setElectricityConsumption(req.getElectricityNew() - electricityOld);
        bill.setElectricityAmount(bill.getElectricityConsumption() * req.getElectricityUnitPrice());

        // Water
        bill.setWaterNew(req.getWaterNew());
        bill.setWaterUnitPrice(req.getWaterUnitPrice());
        bill.setWaterConsumption(req.getWaterNew() - waterOld);
        bill.setWaterAmount(bill.getWaterConsumption() * req.getWaterUnitPrice());

        bill.setInternetPrice(req.getInternetPrice());
        bill.setParkingPrice(req.getParkingPrice());
        bill.setCleaningPrice(req.getCleaningPrice());
        bill.setMaintenancePrice(req.getMaintenancePrice());
        bill.setRentPrice(req.getRentPrice());
        bill.setOtherPrice(req.getOtherPrice());
        bill.setOtherDescription(req.getOtherDescription());

        // Total
        bill.setTotalAmount(
                bill.getElectricityAmount()
                        + bill.getWaterAmount()
                        + (bill.getInternetPrice() != null ? bill.getInternetPrice() : 0)
                        + (bill.getParkingPrice() != null ? bill.getParkingPrice() : 0)
                        + (bill.getCleaningPrice() != null ? bill.getCleaningPrice() : 0)
                        + (bill.getMaintenancePrice() != null ? bill.getMaintenancePrice() : 0)
                        + (bill.getOtherPrice() != null ? bill.getOtherPrice() : 0)
                        + (bill.getRentPrice() != null ? bill.getRentPrice() : 0)
        );

        bill.setUpdatedAt(Instant.now());

        return billMapper.toResponse(billRepository.save(bill));
    }

    @CacheEvict(value = {"bill", "bill_by_contract"}, allEntries = true)
    public void deleteBill(String id) {
        billRepository.deleteById(id);
    }
}