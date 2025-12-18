package com.roomie.services.contract_service.service;

import com.roomie.services.contract_service.dto.event.ContractEvent;
import com.roomie.services.contract_service.dto.event.PaymentCompletedEvent;
import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.dto.response.OTPResponse;
import com.roomie.services.contract_service.dto.response.property.PropertyResponse;
import com.roomie.services.contract_service.entity.Contract;
import com.roomie.services.contract_service.entity.OTPVerification;
import com.roomie.services.contract_service.enums.ContractStatus;
import com.roomie.services.contract_service.exception.AppException;
import com.roomie.services.contract_service.exception.ErrorCode;
import com.roomie.services.contract_service.mapper.ContractMapper;
import com.roomie.services.contract_service.repository.ContractRepository;
import com.roomie.services.contract_service.repository.OTPVerificationRepository;
import com.roomie.services.contract_service.repository.httpclient.ProfileClient;
import com.roomie.services.contract_service.repository.httpclient.PropertyClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

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
    PropertyClient propertyClient;

    @Value("${contract.lock-ttl-seconds:30}")
    long LOCK_TTL = 30;

    @Value("${contract.cache-ttl-seconds:300}")
    long CACHE_TTL = 300;

    @Value("${contract.template-type:FULL}")
    String templateType = "FULL";
    private final ProfileClient profileClient;
    private final OTPVerificationRepository oTPVerificationRepository;
    private final EmailService emailService;

    /**
     * Tạo contract mới - Generate bản PREVIEW
     */
    public ContractResponse create(ContractRequest req) {
        if (req.getBookingId() != null) {
            Optional<Contract> exists = repo.findByBookingId(req.getBookingId());
            if (exists.isPresent()) throw new AppException(ErrorCode.CONTRACT_EXISTS);
        }
        PropertyResponse property = propertyClient.getProperty(req.getPropertyId()).getResult();

        Contract c = mapper.toEntity(req);
        c.setTenantSigned(false);
        c.setLandlordSigned(false);
        c.setMonthlyRent(property.getMonthlyRent());
        c.setRentalDeposit(property.getRentalDeposit());
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
        ev.setBookingId(saved.getBookingId());
        ev.setTenantId(saved.getTenantId());
        ev.setLandlordId(saved.getLandlordId());
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
    public List<Contract> getContractsByLandlord(String landlordId) {
        return repo.findByLandlordId(landlordId);
    }

    public List<Contract> getContractsByTenant(String tenantId) {
        return repo.findByTenantId(tenantId);
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
    public List<ContractResponse> getContractsAsLandlord(String userId) {
        List<Contract> contracts = repo.findByLandlordId(userId);
        return contracts.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ContractResponse> getContractsAsTenant(String userId) {
        List<Contract> contracts = repo.findByTenantId(userId);
        return contracts.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    private String cacheKey(String id) {
        return "cache:contract:" + id;
    }

    private ContractEvent buildEvent(Contract c) {
        return null;
    }

    @Transactional
    public OTPResponse requestTenantOTP(String contractId, String tenantId) {
        // Get contract
        Contract contract = repo.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        // Verify user is tenant
        if (!contract.getTenantId().equals(tenantId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if already signed
        if (contract.isTenantSigned()) {
            throw new AppException(ErrorCode.ALREADY_SIGNED);
        }

        // Get tenant email
        var profileResponse = profileClient.getProfile(tenantId);
        if (profileResponse == null || profileResponse.getResult() == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        String email = profileResponse.getResult().getEmail();

        // Delete old OTP
        oTPVerificationRepository.deleteByContractIdAndUserId(contractId, tenantId);

        // Generate new OTP
        String otpCode = generateOTP();
        Instant expiresAt = Instant.now().plusSeconds(300); // 5 minutes

        OTPVerification otp = OTPVerification.builder()
                .contractId(contractId)
                .userId(tenantId)
                .email(email)
                .otpCode(otpCode)
                .purpose("TENANT_SIGN")
                .verified(false)
                .expiresAt(expiresAt)
                .createdAt(Instant.now())
                .build();

        oTPVerificationRepository.save(otp);

        // Send email
        emailService.sendOTPEmail(email, otpCode, "tenant");

        log.info("OTP sent to tenant {} for contract {}", tenantId, contractId);

        return OTPResponse.builder()
                .message("OTP sent to your email")
                .expiresAt(expiresAt)
                .sent(true)
                .build();
    }

    /**
     * Request OTP for landlord signing
     */
    @Transactional
    public OTPResponse requestLandlordOTP(String contractId, String landlordId) {
        // Get contract
        Contract contract = repo.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        // Verify user is landlord
        if (!contract.getLandlordId().equals(landlordId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if already signed
        if (contract.isLandlordSigned()) {
            throw new AppException(ErrorCode.ALREADY_SIGNED);
        }

        // Get landlord email
        var profileResponse = profileClient.getProfile(landlordId);
        if (profileResponse == null || profileResponse.getResult() == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        String email = profileResponse.getResult().getEmail();

        // Delete old OTP
        oTPVerificationRepository.deleteByContractIdAndUserId(contractId, landlordId);

        // Generate new OTP
        String otpCode = generateOTP();
        Instant expiresAt = Instant.now().plusSeconds(300); // 5 minutes

        OTPVerification otp = OTPVerification.builder()
                .contractId(contractId)
                .userId(landlordId)
                .email(email)
                .otpCode(otpCode)
                .purpose("LANDLORD_SIGN")
                .verified(false)
                .expiresAt(expiresAt)
                .createdAt(Instant.now())
                .build();

        oTPVerificationRepository.save(otp);

        // Send email
        emailService.sendOTPEmail(email, otpCode, "landlord");

        log.info("OTP sent to landlord {} for contract {}", landlordId, contractId);

        return OTPResponse.builder()
                .message("OTP sent to your email")
                .expiresAt(expiresAt)
                .sent(true)
                .build();
    }

    /**
     * Tenant signs contract with OTP verification
     */
    @Transactional
    public ContractResponse tenantSignWithOTP(String contractId, String otpCode) {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Verify OTP
        OTPVerification otp = oTPVerificationRepository.findByContractIdAndUserIdAndPurposeAndVerifiedFalseAndExpiresAtAfter(
                contractId,
                tenantId,
                "TENANT_SIGN",
                Instant.now()
        ).orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        // Check OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Mark OTP as verified
        otp.setVerified(true);
        oTPVerificationRepository.save(otp);

        // Sign contract (use existing logic)
        return tenantSign(contractId, null);
    }

    /**
     * Landlord signs contract with OTP verification
     */
    @Transactional
    public ContractResponse landlordSignWithOTP(String contractId, String otpCode) {
        String landlordId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Verify OTP
        OTPVerification otp = oTPVerificationRepository.findByContractIdAndUserIdAndPurposeAndVerifiedFalseAndExpiresAtAfter(
                contractId,
                landlordId,
                "LANDLORD_SIGN",
                Instant.now()
        ).orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        // Check OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Mark OTP as verified
        otp.setVerified(true);
        oTPVerificationRepository.save(otp);

        // Sign contract (use existing logic)
        return landlordSign(contractId, null);
    }

    /**
     * Generate 6-digit OTP
     */
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}