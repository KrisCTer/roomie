package com.roomie.services.contract_service.service;

import com.roomie.services.contract_service.dto.event.ContractEvent;
import com.roomie.services.contract_service.dto.event.PaymentCompletedEvent;
import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.entity.Contract;
import com.roomie.services.contract_service.enums.ContractStatus;
import com.roomie.services.contract_service.exception.AppException;
import com.roomie.services.contract_service.exception.ErrorCode;
import com.roomie.services.contract_service.mapper.ContractMapper;
import com.roomie.services.contract_service.repository.ContractRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ContractService {
    ContractRepository repo;
    ContractMapper mapper;
    PdfFileService pdfFileService;
    ContractTemplateService templateService;
    DigitalSignatureService signatureService;
    RedisLockService lockService;
    RedisCacheService cacheService;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${contract.lock-ttl-seconds:30}")
    long LOCK_TTL = 30;

    @Value("${contract.cache-ttl-seconds:300}")
    long CACHE_TTL = 300;

    @Value("${contract.template-type:FULL}")
    String templateType = "FULL";

    /**
     * Tạo contract mới - Generate bản PREVIEW
     */
    public ContractResponse create(ContractRequest req) {
        if (req.getBookingId() != null) {
            Optional<Contract> exists = repo.findByBookingId(req.getBookingId());
            if (exists.isPresent()) throw new AppException(ErrorCode.CONTRACT_EXISTS);
        }

        Contract c = mapper.toEntity(req);
        c.setTenantSigned(false);
        c.setLandlordSigned(false);
        c.setCreatedAt(Instant.now());
        c.setUpdatedAt(Instant.now());
        c.setStatus(ContractStatus.DRAFT);

        // ✅ Generate PREVIEW PDF (bản xem trước)
        String previewHtml = templateService.buildPreviewContractHtml(c);
        String fileName = "contract-preview-" +
                (c.getBookingId() != null ? c.getBookingId() : System.currentTimeMillis()) + ".pdf";
        String url = pdfFileService.generateUploadAndSignUrl(
                fileName,
                previewHtml,
                c.getId() != null ? c.getId() : "draft"
        );
        c.setPdfUrl(url);

        // Sign token
        String payload = (c.getBookingId() != null ? c.getBookingId() : "b-" + System.currentTimeMillis())
                + "|" + url + "|" + System.currentTimeMillis();
        c.setSignatureToken(signatureService.sign(payload));

        Contract saved = repo.save(c);
        cacheService.put(cacheKey(saved.getId()), saved, CACHE_TTL);

        ContractEvent ev = new ContractEvent();
        ev.setContractId(saved.getId());
        ev.setBookingId(saved.getBookingId());
        ev.setTenantId(saved.getTenantId());
        ev.setPropertyId(saved.getPropertyId());

        kafkaTemplate.send("contract.created", ev);
        log.info("Created contract PREVIEW for bookingId={}, contractId={}",
                saved.getBookingId(), saved.getId());

        return mapper.toResponse(saved);
    }

    public Optional<ContractResponse> getById(String id) {
        Optional<Contract> cached = cacheService.get(cacheKey(id), Contract.class);
        if (cached.isPresent()) return cached.map(mapper::toResponse);
        return repo.findById(id).map(c -> {
            cacheService.put(cacheKey(id), c, CACHE_TTL);
            return mapper.toResponse(c);
        });
    }

    /**
     * Tenant ký hợp đồng
     */
    @Transactional
    public ContractResponse tenantSign(String id, String signaturePayload) {
        String lockKey = "lock:contract:" + id;
        String token = lockService.tryLock(lockKey, LOCK_TTL);
        if (token == null) throw new AppException(ErrorCode.RESOURCE_LOCKED);

        try {
            Contract c = repo.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
            if (c.isTenantSigned()) throw new AppException(ErrorCode.ALREADY_SIGNED);

            c.setTenantSigned(true);
            c.setUpdatedAt(Instant.now());

            // ✅ Check if both signed -> regenerate FINAL PDF
            if (c.isLandlordSigned()) {
                c.setStatus(ContractStatus.PENDING_PAYMENT);
                regenerateFinalPdf(c);
                kafkaTemplate.send("contract.pending_payment", buildEvent(c));
                log.info("Both parties signed - Generated FINAL PDF for contractId={}", c.getId());
            } else {
                c.setStatus(ContractStatus.PENDING_SIGNATURE);
            }

            repo.save(c);
            cacheService.put(cacheKey(id), c, CACHE_TTL);
            kafkaTemplate.send("contract.signed", buildEvent(c));
            log.info("Tenant signed contract contractId={}", c.getId());

            return mapper.toResponse(c);
        } finally {
            lockService.releaseLock(lockKey, token);
        }
    }

    /**
     * Landlord ký hợp đồng
     */
    @Transactional
    public ContractResponse landlordSign(String id, String signaturePayload) {
        String lockKey = "lock:contract:" + id;
        String token = lockService.tryLock(lockKey, LOCK_TTL);
        if (token == null) throw new AppException(ErrorCode.RESOURCE_LOCKED);

        try {
            Contract c = repo.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
            if (c.isLandlordSigned()) throw new AppException(ErrorCode.ALREADY_SIGNED);

            c.setLandlordSigned(true);
            c.setUpdatedAt(Instant.now());

            // ✅ Check if both signed -> regenerate FINAL PDF
            if (c.isTenantSigned()) {
                c.setStatus(ContractStatus.PENDING_PAYMENT);
                regenerateFinalPdf(c);
                kafkaTemplate.send("contract.pending_payment", buildEvent(c));
                log.info("Both parties signed - Generated FINAL PDF for contractId={}", c.getId());
            } else {
                c.setStatus(ContractStatus.PENDING_SIGNATURE);
            }

            repo.save(c);
            cacheService.put(cacheKey(id), c, CACHE_TTL);
            kafkaTemplate.send("contract.signed", buildEvent(c));
            log.info("Landlord signed contract contractId={}", c.getId());

            return mapper.toResponse(c);
        } finally {
            lockService.releaseLock(lockKey, token);
        }
    }

    /**
     * Payment completed listener
     */
    @Transactional
    public void onPaymentCompleted(PaymentCompletedEvent evt) {
        if (evt == null || evt.getBookingId() == null) return;
        repo.findByBookingId(evt.getBookingId()).ifPresent(c -> {
            c.setStatus(ContractStatus.ACTIVE);
            c.setUpdatedAt(Instant.now());
            repo.save(c);
            cacheService.put(cacheKey(c.getId()), c, CACHE_TTL);
            kafkaTemplate.send("contract.activated", buildEvent(c));
            log.info("Contract activated after payment for contractId={}", c.getId());
        });
    }

    public ContractResponse pause(String id, String reason) {
        Contract contract = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
        contract.setStatus(ContractStatus.PAUSED);
        contract.setUpdatedAt(Instant.now());
        return mapper.toResponse(repo.save(contract));
    }

    public ContractResponse resume(String id) {
        Contract contract = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setUpdatedAt(Instant.now());
        return mapper.toResponse(repo.save(contract));
    }

    public ContractResponse terminate(String id, String reason) {
        Contract contract = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
        contract.setStatus(ContractStatus.TERMINATED);
        contract.setUpdatedAt(Instant.now());
        Contract saved = repo.save(contract);
        kafkaTemplate.send("contract.terminated", buildEvent(saved));
        return mapper.toResponse(saved);
    }
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void expireContracts() {
        Instant now = Instant.now();

        List<Contract> expiring = repo.findByStatusAndEndDateBefore(
                ContractStatus.ACTIVE,
                now
        );

        for (Contract contract : expiring) {
            contract.setStatus(ContractStatus.EXPIRED);
            contract.setEndDate(now);
            contract.setUpdatedAt(now);

            Contract saved = repo.save(contract);

            kafkaTemplate.send("contract.expired", buildEvent(saved));
        }
    }
    public ContractResponse renew(String id, ContractRequest renewalRequest) {
        Contract oldContract = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));

        if (oldContract.getStatus() != ContractStatus.EXPIRED) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_STATUS,
                    "Only EXPIRED contracts can be renewed. Current: " + oldContract.getStatus()
            );
        }

        // Mark old as RENEWED
        oldContract.setStatus(ContractStatus.RENEWED);
        oldContract.setUpdatedAt(Instant.now());
        repo.save(oldContract);

        // Create new contract
        ContractResponse newContract = create(renewalRequest);

        return newContract;
    }

    /**
     * ✅ Regenerate FINAL PDF khi cả 2 bên đã ký
     */
    private void regenerateFinalPdf(Contract contract) {
        try {
            String finalHtml = templateService.buildFinalContractHtml(contract);
            String fileName = "contract-final-" + contract.getId() + ".pdf";
            String newUrl = pdfFileService.generateUploadAndSignUrl(
                    fileName,
                    finalHtml,
                    contract.getId()
            );

            contract.setPdfUrl(newUrl);

            // Update signature token
            String payload = contract.getId() + "|" + newUrl + "|" + System.currentTimeMillis();
            contract.setSignatureToken(signatureService.sign(payload));

            log.info("Regenerated FINAL PDF for contractId={}, new URL={}",
                    contract.getId(), newUrl);
        } catch (Exception e) {
            log.error("Failed to regenerate final PDF for contractId={}", contract.getId(), e);
            // Don't throw - let the signing process continue
        }
    }

    private String cacheKey(String id) {
        return "cache:contract:" + id;
    }

    private ContractEvent buildEvent(Contract c) {
        return new ContractEvent(
                c.getId(),
                c.getBookingId(),
                c.getTenantId(),
                c.getPropertyId()
        );
    }
}