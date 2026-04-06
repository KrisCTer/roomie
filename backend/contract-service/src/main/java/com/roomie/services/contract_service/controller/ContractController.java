package com.roomie.services.contract_service.controller;

import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.request.ContractAmendmentRequest;
import com.roomie.services.contract_service.dto.request.ContractSupplementaryTermsRequest;
import com.roomie.services.contract_service.dto.request.OTPSignRequest;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.dto.response.OTPResponse;
import com.roomie.services.contract_service.exception.AppException;
import com.roomie.services.contract_service.exception.ErrorCode;
import com.roomie.services.contract_service.mapper.ContractMapper;
import com.roomie.services.contract_service.service.ContractService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    ContractService contractService;
    ContractMapper contractMapper;

    @PostMapping
    public ApiResponse<ContractResponse> create(@RequestBody ContractRequest req) {
        return ApiResponse.success(contractService.create(req), "Created contract successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<ContractResponse> get(@PathVariable String id) {
        ContractResponse contract = contractService.getById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        return ApiResponse.success(contract, "Fetched contract successfully");
    }

    @GetMapping("/my-contracts")
    public ApiResponse<Map<String, List<ContractResponse>>> getMyContracts() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<ContractResponse> asLandlord = contractService.getContractsByLandlord(userId).stream()
                .map(contractMapper::toResponse)
                .toList();

        List<ContractResponse> asTenant = contractService.getContractsByTenant(userId).stream()
                .map(contractMapper::toResponse)
                .toList();

        Map<String, List<ContractResponse>> result = new HashMap<>();
        result.put("asLandlord", asLandlord);
        result.put("asTenant", asTenant);

        return ApiResponse.success(result, "Fetched contracts successfully");
    }

    @PostMapping("/{id}/sign/tenant")
    public ApiResponse<ContractResponse> tenantSign(@PathVariable String id,
            @RequestBody(required = false) String payload) {
        return ApiResponse.success(contractService.tenantSign(id, payload), "Tenant signed contract successfully");
    }

    @PostMapping("/{id}/sign/tenant/otp")
    public ApiResponse<ContractResponse> tenantSignWithOTP(@PathVariable String id, @RequestBody OTPSignRequest req) {
        return ApiResponse.success(contractService.tenantSignWithOTP(id, req), "Tenant signed with OTP");
    }

    @PostMapping("/{id}/sign/landlord")
    public ApiResponse<ContractResponse> landlordSign(@PathVariable String id,
            @RequestBody(required = false) String payload) {
        return ApiResponse.success(contractService.landlordSign(id, payload), "Landlord signed contract successfully");
    }

    @PostMapping("/{id}/sign/landlord/otp")
    public ApiResponse<ContractResponse> landlordSignWithOTP(@PathVariable String id, @RequestBody OTPSignRequest req) {
        return ApiResponse.success(contractService.landlordSignWithOTP(id, req), "Landlord signed with OTP");
    }

    @GetMapping("/{id}/pdf")
    public ApiResponse<PdfInfo> downloadPdf(@PathVariable String id) {
        ContractResponse contract = contractService.getById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        return ApiResponse.success(new PdfInfo(contract.getPdfUrl()), "Fetched contract PDF url successfully");
    }

    @GetMapping("/{id}/signature-status")
    public ApiResponse<SignatureStatus> getSignatureStatus(@PathVariable String id) {
        ContractResponse contract = contractService.getById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        SignatureStatus status = new SignatureStatus(
                contract.isTenantSigned(),
                contract.isLandlordSigned(),
                contract.isTenantSigned() && contract.isLandlordSigned(),
                contract.getStatus().toString(),
                contract.getPdfUrl());
        return ApiResponse.success(status, "Fetched signature status successfully");
    }

    @PostMapping("/{id}/pause")
    public ApiResponse<ContractResponse> pauseContract(@PathVariable String id,
            @RequestParam(required = false) String reason) {
        return ApiResponse.success(contractService.pause(id, reason), "Contract paused successfully");
    }

    @PostMapping("/{id}/resume")
    public ApiResponse<ContractResponse> resumeContract(@PathVariable String id) {
        return ApiResponse.success(contractService.resume(id), "Contract resumed successfully");
    }

    @PostMapping("/{id}/terminate")
    public ApiResponse<ContractResponse> terminateContract(@PathVariable String id,
            @RequestParam(required = false) String reason) {
        return ApiResponse.success(contractService.terminate(id, reason), "Contract terminated successfully");
    }

    @PostMapping("/{id}/request-otp/tenant")
    public ApiResponse<OTPResponse> requestTenantOTP(@PathVariable String id) {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(contractService.requestTenantOTP(id, tenantId),
                "OTP sent to your email successfully");
    }

    @PostMapping("/{id}/request-otp/landlord")
    public ApiResponse<OTPResponse> requestLandlordOTP(@PathVariable String id) {
        String landlordId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(contractService.requestLandlordOTP(id, landlordId),
                "OTP sent to your email successfully");
    }

    @PutMapping("/{id}/payment-completed")
    public ApiResponse<ContractResponse> onPaymentCompleted(@PathVariable String id) {
        return ApiResponse.success(contractService.markPaymentCompleted(id),
                "Contract activated after payment successfully");
    }

    @PutMapping("/{id}/supplementary-terms")
    public ApiResponse<ContractResponse> updateSupplementaryTerms(
            @PathVariable String id,
            @RequestBody ContractSupplementaryTermsRequest request) {
        return ApiResponse.success(
                contractService.updateSupplementaryTerms(id, request),
                "Updated supplementary terms successfully");
    }

    @PostMapping("/{id}/amendments")
    public ApiResponse<ContractResponse> addAmendment(
            @PathVariable String id,
            @RequestBody ContractAmendmentRequest request) {
        return ApiResponse.success(
                contractService.addAmendment(id, request),
                "Added contract amendment successfully");
    }

    @PostMapping("/{id}/amendments/{amendmentId}/approve")
    public ApiResponse<ContractResponse> approveAmendment(
            @PathVariable String id,
            @PathVariable String amendmentId) {
        return ApiResponse.success(
                contractService.approveAmendment(id, amendmentId),
                "Approved contract amendment successfully");
    }

    private record SignatureStatus(
            boolean tenantSigned,
            boolean landlordSigned,
            boolean bothSigned,
            String contractStatus,
            String pdfUrl) {
    }

    private record PdfInfo(String pdfUrl) {
    }
}
