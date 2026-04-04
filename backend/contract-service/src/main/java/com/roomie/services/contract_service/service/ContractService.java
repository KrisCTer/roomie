package com.roomie.services.contract_service.service;

import com.roomie.services.contract_service.dto.event.ContractEvent;
import com.roomie.services.contract_service.dto.event.PaymentCompletedEvent;
import com.roomie.services.contract_service.dto.request.BillRequest;
import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.request.OTPSignRequest;
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
import com.roomie.services.contract_service.repository.httpclient.BillingClient;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Random;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ContractService {
    ContractRepository contractRepository;
    ContractMapper contractMapper;
    PdfFileService pdfFileService;
    ContractTemplateService templateService;
    DigitalSignatureService signatureService;
    RedisLockService lockService;
    RedisCacheService cacheService;
    KafkaTemplate<String, Object> kafkaTemplate;
    PropertyClient propertyClient;
    BillingClient billingClient;
    ProfileClient profileClient;
    OTPVerificationRepository otpVerificationRepository;
    EmailService emailService;

    @Value("${contract.lock-ttl-seconds:30}")
    long LOCK_TTL = 30;

    @Value("${contract.cache-ttl-seconds:300}")
    long CACHE_TTL = 300;

    @Value("${contract.template-type:FULL}")
    String templateType = "FULL";


    public ContractResponse create(ContractRequest req) {
        if (req.getBookingId() != null) {
            Optional<Contract> exists = contractRepository.findByBookingId(req.getBookingId());
            if (exists.isPresent())
                throw new AppException(ErrorCode.CONTRACT_EXISTS);
        }
        PropertyResponse property = propertyClient.getProperty(req.getPropertyId()).getResult();


        Contract c = contractMapper.toEntity(req);
        c.setTenantSigned(false);
        c.setLandlordSigned(false);
        c.setMonthlyRent(property.getMonthlyRent());
        c.setRentalDeposit(property.getRentalDeposit());
        c.setCreatedAt(Instant.now());
        c.setUpdatedAt(Instant.now());
        c.setStatus(ContractStatus.DRAFT);

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

        Contract saved = contractRepository.save(c);
        cacheService.put(cacheKey(saved.getId()), saved, CACHE_TTL);

        createDepositBill(saved);

        ContractEvent ev = buildEvent(saved);
        kafkaTemplate.send("contract.created", ev);
        log.info("Created contract PREVIEW for bookingId={}, contractId={}",
                saved.getBookingId(), saved.getId());

        return contractMapper.toResponse(saved);
    }

    private void createDepositBill(Contract contract) {
        try {
            // Lấy tháng bắt đầu thuê
            LocalDate startDate = contract.getStartDate().atZone(ZoneId.systemDefault()).toLocalDate();
            String billingMonth = startDate.getYear() + "-" +
                    String.format("%02d", startDate.getMonthValue());

            // Tạo request để tạo bill
            BillRequest billRequest = BillRequest.builder()
                    .contractId(contract.getId())
                    .billingMonth(billingMonth)
                    .rentalDeposit(contract.getRentalDeposit())
                    .monthlyRent(BigDecimal.ZERO)
                    .notes("Tiền cọc hợp đồng - Deposit payment for contract")
                    .build();

            // Gọi Billing Service để tạo bill
            billingClient.createBill(billRequest);

            log.info("Auto-created deposit bill for contract: {}, amount: {}",
                    contract.getId(), contract.getRentalDeposit());

        } catch (Exception e) {
            log.error("Failed to auto-create deposit bill for contract: {}",
                    contract.getId(), e);
            // Không throw exception để không làm gián đoạn việc tạo contract
        }
    }

    public Optional<ContractResponse> getById(String id) {
        Optional<Contract> cached = cacheService.get(cacheKey(id), Contract.class);
        if (cached.isPresent())
            return cached.map(contractMapper::toResponse);
        return contractRepository.findById(id).map(c -> {
            cacheService.put(cacheKey(id), c, CACHE_TTL);
            return contractMapper.toResponse(c);
        });
    }
    public List<Contract> getContractsByLandlord(String landlordId) {
        return contractRepository.findByLandlordId(landlordId);
    }

    public List<Contract> getContractsByTenant(String tenantId) {
        return contractRepository.findByTenantId(tenantId);
    }
    @Transactional
    public ContractResponse tenantSign(String id, String signaturePayload) {
        String lockKey = "lock:contract:" + id;
        String token = lockService.tryLock(lockKey, LOCK_TTL);
        if (token == null) throw new AppException(ErrorCode.RESOURCE_LOCKED);

        try {
            Contract c = contractRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
            if (c.isTenantSigned()) throw new AppException(ErrorCode.ALREADY_SIGNED);

            c.setTenantSigned(true);
            c.setUpdatedAt(Instant.now());

            if (c.isLandlordSigned()) {
                c.setStatus(ContractStatus.PENDING_PAYMENT);
                regenerateFinalPdf(c);
                kafkaTemplate.send("contract.pending_payment", buildEvent(c));
                log.info("Both parties signed - Generated FINAL PDF for contractId={}", c.getId());
            } else {
                c.setStatus(ContractStatus.PENDING_SIGNATURE);
            }

            contractRepository.save(c);
            cacheService.put(cacheKey(id), c, CACHE_TTL);
            ContractEvent event = buildEvent(c);
            event.setSignedBy("TENANT");
            kafkaTemplate.send("contract.signed", event);
            log.info("Tenant signed contract contractId={}", c.getId());

            return contractMapper.toResponse(c);
        } finally {
            lockService.releaseLock(lockKey, token);
        }
    }

    @Transactional
    public ContractResponse landlordSign(String id, String signaturePayload) {
        String lockKey = "lock:contract:" + id;
        String token = lockService.tryLock(lockKey, LOCK_TTL);
        if (token == null) throw new AppException(ErrorCode.RESOURCE_LOCKED);

        try {
            Contract c = contractRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
            if (c.isLandlordSigned()) throw new AppException(ErrorCode.ALREADY_SIGNED);

            c.setLandlordSigned(true);
            c.setUpdatedAt(Instant.now());

            if (c.isTenantSigned()) {
                c.setStatus(ContractStatus.PENDING_PAYMENT);
                regenerateFinalPdf(c);
                kafkaTemplate.send("contract.pending_payment", buildEvent(c));
                log.info("Both parties signed - Generated FINAL PDF for contractId={}", c.getId());
            } else {
                c.setStatus(ContractStatus.PENDING_SIGNATURE);
            }

            contractRepository.save(c);
            cacheService.put(cacheKey(id), c, CACHE_TTL);
            ContractEvent event = buildEvent(c);
            event.setSignedBy("LANDLORD");
            kafkaTemplate.send("contract.signed", event);
            log.info("Landlord signed contract contractId={}", c.getId());

            return contractMapper.toResponse(c);
        } finally {
            lockService.releaseLock(lockKey, token);
        }
    }

    @Transactional
    public void onPaymentCompleted(PaymentCompletedEvent evt) {
        if (evt == null || evt.getBookingId() == null) return;

        contractRepository.findByBookingId(evt.getBookingId()).ifPresent(contract -> {
            try {
                markPaymentCompleted(contract.getId());
            } catch (Exception e) {
                log.error("Failed to activate contract for bookingId={}", evt.getBookingId(), e);
            }
        });
    }

    @Transactional
    public ContractResponse markPaymentCompleted(String contractId) {
        String lockKey = "lock:contract:" + contractId;
        String token = lockService.tryLock(lockKey, LOCK_TTL);
        if (token == null) throw new AppException(ErrorCode.RESOURCE_LOCKED);

        try {
            Contract contract = contractRepository.findById(contractId)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

            if (contract.getStatus() != ContractStatus.PENDING_PAYMENT) {
                throw new AppException(ErrorCode.INVALID_CONTRACT_STATUS,
                        "Contract must be in PENDING_PAYMENT status. Current: " + contract.getStatus());
            }

            contract.setStatus(ContractStatus.ACTIVE);
            contract.setUpdatedAt(Instant.now());

            try {
                propertyClient.markAsRented(contract.getPropertyId());
            } catch (Exception e) {
                log.error("Failed to mark property as rented for propertyId={}",
                        contract.getPropertyId(), e);
            }

            Contract saved = contractRepository.save(contract);
            cacheService.put(cacheKey(contractId), saved, CACHE_TTL);

            // Publish event
            kafkaTemplate.send("contract.activated", buildEvent(saved));
            log.info("Contract activated after payment for contractId={}", contractId);

            return contractMapper.toResponse(saved);
        } finally {
            lockService.releaseLock(lockKey, token);
        }
    }

    public ContractResponse pause(String id, String reason) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        contract.setStatus(ContractStatus.PAUSED);
        contract.setUpdatedAt(Instant.now());
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    public ContractResponse resume(String id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setUpdatedAt(Instant.now());
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    public ContractResponse terminate(String id, String reason) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        contract.setStatus(ContractStatus.TERMINATED);
        contract.setUpdatedAt(Instant.now());
        propertyClient.markAsAvailable(contract.getPropertyId());
        Contract saved = contractRepository.save(contract);
        kafkaTemplate.send("contract.terminated", buildEvent(saved));
        return contractMapper.toResponse(saved);
    }

    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void expireContracts() {
        Instant now = Instant.now();

        List<Contract> expiring = contractRepository.findByStatusAndEndDateBefore(
                ContractStatus.ACTIVE,
                now
        );

        for (Contract contract : expiring) {
            contract.setStatus(ContractStatus.EXPIRED);
            contract.setEndDate(now);
            contract.setUpdatedAt(now);

            Contract saved = contractRepository.save(contract);

            kafkaTemplate.send("contract.expired", buildEvent(saved));
        }
    }

    public ContractResponse renew(String id, ContractRequest renewalRequest) {
        Contract oldContract = contractRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        if (oldContract.getStatus() != ContractStatus.EXPIRED) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_STATUS,
                    "Only EXPIRED contracts can be renewed. Current: " + oldContract.getStatus()
            );
        }

        // Mark old as RENEWED
        oldContract.setStatus(ContractStatus.RENEWED);
        oldContract.setUpdatedAt(Instant.now());
        contractRepository.save(oldContract);

        // Create new contract
        ContractResponse newContract = create(renewalRequest);

        return newContract;
    }

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
        List<Contract> contracts = contractRepository.findByLandlordId(userId);
        return contracts.stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    public List<ContractResponse> getContractsAsTenant(String userId) {
        List<Contract> contracts = contractRepository.findByTenantId(userId);
        return contracts.stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    private String cacheKey(String id) {
        return "cache:contract:" + id;
    }

    private ContractEvent buildEvent(Contract c) {
        PropertyResponse property = null;
        try {
            property = propertyClient.getProperty(c.getPropertyId()).getResult();
        } catch (Exception e) {
            log.warn("Failed to fetch property details for event", e);
        }

        // Get tenant and landlord info
        String tenantName = "Unknown Tenant";
        String landlordName = "Unknown Landlord";

        try {
            var tenantProfile = profileClient.getProfile(c.getTenantId());
            if (tenantProfile != null && tenantProfile.getResult() != null) {
                tenantName = tenantProfile.getResult().getFirstName();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch tenant profile", e);
        }

        try {
            var landlordProfile = profileClient.getProfile(c.getLandlordId());
            if (landlordProfile != null && landlordProfile.getResult() != null) {
                landlordName = landlordProfile.getResult().getFirstName();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch landlord profile", e);
        }

        return ContractEvent.builder()
                .contractId(c.getId())
                .bookingId(c.getBookingId())
                .propertyId(c.getPropertyId())
                .propertyTitle(property != null ? property.getTitle() : "Unknown Property")
                .tenantId(c.getTenantId())
                .tenantName(tenantName)
                .landlordId(c.getLandlordId())
                .landlordName(landlordName)
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .monthlyRent(c.getMonthlyRent())
                .rentalDeposit(c.getRentalDeposit())
                .status(c.getStatus().name())
                .tenantSigned(c.isTenantSigned())
                .landlordSigned(c.isLandlordSigned())
                .build();
    }

    @Transactional
    public OTPResponse requestTenantOTP(String contractId, String tenantId) {
        // Get contract
        Contract contract = contractRepository.findById(contractId)
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
        otpVerificationRepository.deleteByContractIdAndUserId(contractId, tenantId);

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

        otpVerificationRepository.save(otp);

        // Send email
        emailService.sendOTPEmail(email, otpCode, "tenant");

        log.info("OTP sent to tenant {} for contract {}", tenantId, contractId);

        return OTPResponse.builder()
                .message("OTP sent to your email")
                .expiresAt(expiresAt)
                .sent(true)
                .build();
    }

    @Transactional
    public OTPResponse requestLandlordOTP(String contractId, String landlordId) {
        // Get contract
        Contract contract = contractRepository.findById(contractId)
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
        otpVerificationRepository.deleteByContractIdAndUserId(contractId, landlordId);

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

        otpVerificationRepository.save(otp);

        // Send email
        emailService.sendOTPEmail(email, otpCode, "landlord");

        log.info("OTP sent to landlord {} for contract {}", landlordId, contractId);

        return OTPResponse.builder()
                .message("OTP sent to your email")
                .expiresAt(expiresAt)
                .sent(true)
                .build();
    }

    @Transactional
    public ContractResponse tenantSignWithOTP(String contractId, OTPSignRequest req) {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Verify OTP
        OTPVerification otp = otpVerificationRepository.findByContractIdAndUserIdAndPurposeAndVerifiedFalseAndExpiresAtAfter(
                contractId,
                tenantId,
                "TENANT_SIGN",
                Instant.now()
        ).orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        // Check OTP code
        if (!otp.getOtpCode().equals(req.getOtpCode())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Mark OTP as verified
        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        // Sign contract (use existing logic)
        return tenantSign(contractId, null);
    }

    @Transactional
    public ContractResponse landlordSignWithOTP(String contractId, OTPSignRequest req) {
        String landlordId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Verify OTP
        OTPVerification otp = otpVerificationRepository.findByContractIdAndUserIdAndPurposeAndVerifiedFalseAndExpiresAtAfter(
                contractId,
                landlordId,
                "LANDLORD_SIGN",
                Instant.now()
        ).orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        // Check OTP code
        if (!otp.getOtpCode().equals(req.getOtpCode())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Mark OTP as verified
        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        // Sign contract (use existing logic)
        return landlordSign(contractId, null);
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}