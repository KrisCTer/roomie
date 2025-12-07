package com.roomie.services.contract_service.controller;

import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.dto.response.OTPResponse;
import com.roomie.services.contract_service.entity.Contract;
import com.roomie.services.contract_service.mapper.ContractMapper;
import com.roomie.services.contract_service.repository.httpclient.FileClient;
import com.roomie.services.contract_service.service.ContractService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {
    ContractService service;
    ContractMapper contractMapper;

    /**
     * Tạo contract mới (sẽ tạo bản PREVIEW)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ContractResponse>> create(@RequestBody ContractRequest req) {
        log.info("Creating new contract for bookingId={}", req.getBookingId());
        ContractResponse data = service.create(req);
        return ResponseEntity.ok(
                ApiResponse.success(data, "Created contract successfully")
        );
    }

    /**
     * Lấy thông tin contract
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractResponse>> get(@PathVariable String id) {
        return service.getById(id)
                .map(contract -> ResponseEntity.ok(
                        ApiResponse.success(contract, "Fetched contract successfully")
                ))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Contract not found", 404)));
    }

    @GetMapping("/my-contracts")
    public ApiResponse<Map<String, List<ContractResponse>>> getMyContracts() {

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Contract> landlordContracts = service.getContractsByLandlord(userId);
        List<Contract> tenantContracts = service.getContractsByTenant(userId);

        List<ContractResponse> asLandlord = landlordContracts.stream()
                .map(contractMapper::toResponse)
                .toList();

        List<ContractResponse> asTenant = tenantContracts.stream()
                .map(contractMapper::toResponse)
                .toList();

        Map<String, List<ContractResponse>> result = new HashMap<>();
        result.put("asLandlord", asLandlord);
        result.put("asTenant", asTenant);

        return ApiResponse.<Map<String, List<ContractResponse>>>builder()
                .code(1000)
                .success(true)
                .result(result)
                .build();
    }




    /**
     * Tenant ký hợp đồng
     * - Nếu landlord đã ký -> tạo bản FINAL
     * - Nếu chưa -> status = PENDING_SIGNATURE
     */
    @PostMapping("/{id}/sign/tenant")
    public ResponseEntity<ApiResponse<ContractResponse>> tenantSign(
            @PathVariable String id,
            @RequestBody(required = false) String payload) {

        log.info("Tenant signing contract contractId={}", id);
        ContractResponse data = service.tenantSign(id, payload);

        return ResponseEntity.ok(
                ApiResponse.success(data, "Tenant signed contract successfully")
        );
    }

    /**
     * Landlord ký hợp đồng
     * - Nếu tenant đã ký -> tạo bản FINAL
     * - Nếu chưa -> status = PENDING_SIGNATURE
     */
    @PostMapping("/{id}/sign/landlord")
    public ResponseEntity<ApiResponse<ContractResponse>> landlordSign(
            @PathVariable String id,
            @RequestBody(required = false) String payload) {

        log.info("Landlord signing contract contractId={}", id);
        ContractResponse data = service.landlordSign(id, payload);

        return ResponseEntity.ok(
                ApiResponse.success(data, "Landlord signed contract successfully")
        );
    }

    /**
     * Download PDF contract
     * URL sẽ tự động trỏ đến bản PREVIEW hoặc FINAL tùy trạng thái
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<PdfInfo>> downloadPdf(@PathVariable String id) {
        return service.getById(id)
                .map(contract -> {
                    PdfInfo body = new PdfInfo(contract.getPdfUrl());
                    return ResponseEntity.ok(
                            ApiResponse.success(body, "Fetched contract PDF url successfully")
                    );
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Contract not found", 404)));
    }

    /**
     * Kiểm tra trạng thái ký
     */
    @GetMapping("/{id}/signature-status")
    public ResponseEntity<ApiResponse<SignatureStatus>> getSignatureStatus(@PathVariable String id) {
        return service.getById(id)
                .map(contract -> {
                    SignatureStatus status = new SignatureStatus(
                            contract.isTenantSigned(),
                            contract.isLandlordSigned(),
                            contract.isTenantSigned() && contract.isLandlordSigned(),
                            contract.getStatus().toString(),
                            contract.getPdfUrl()
                    );
                    return ResponseEntity.ok(
                            ApiResponse.success(status, "Fetched signature status successfully")
                    );
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Contract not found", 404)));
    }

    @PostMapping("/{id}/pause")
    public ApiResponse<ContractResponse> pauseContract(
            @PathVariable String id,
            @RequestParam(required = false) String reason
    ) {
        ContractResponse response = service.pause(id, reason);
        return ApiResponse.success(response, "Contract paused successfully");
    }

    @PostMapping("/{id}/resume")
    public ApiResponse<ContractResponse> resumeContract(@PathVariable String id) {
        ContractResponse response = service.resume(id);
        return ApiResponse.success(response, "Contract resumed successfully");
    }

    @PostMapping("/{id}/terminate")
    public ApiResponse<ContractResponse> terminateContract(
            @PathVariable String id,
            @RequestParam(required = false) String reason
    ) {
        ContractResponse response = service.terminate(id, reason);
        return ApiResponse.success(response, "Contract terminated successfully");
    }

    @PostMapping("/{id}/request-otp/tenant")
    public ResponseEntity<ApiResponse<OTPResponse>> requestTenantOTP(@PathVariable String id) {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();
        OTPResponse response = service.requestTenantOTP(id, tenantId);
        return ResponseEntity.ok(
                ApiResponse.success(response, "OTP sent to your email successfully")
        );
    }

    @PostMapping("/{id}/request-otp/landlord")
    public ResponseEntity<ApiResponse<OTPResponse>> requestLandlordOTP(@PathVariable String id) {
        String landlordId = SecurityContextHolder.getContext().getAuthentication().getName();
        OTPResponse response = service.requestLandlordOTP(id, landlordId);
        return ResponseEntity.ok(
                ApiResponse.success(response, "OTP sent to your email successfully")
        );
    }

    // Inner DTO for signature status
    private record SignatureStatus(
            boolean tenantSigned,
            boolean landlordSigned,
            boolean bothSigned,
            String contractStatus,
            String pdfUrl
    ) {
    }

    private record PdfInfo(String pdfUrl) {
    }
}
