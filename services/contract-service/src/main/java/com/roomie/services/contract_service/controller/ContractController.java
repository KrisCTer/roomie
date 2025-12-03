package com.roomie.services.contract_service.controller;

import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.repository.httpclient.FileClient;
import com.roomie.services.contract_service.service.ContractService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {
    ContractService service;

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

    // Inner DTO for signature status
    private record SignatureStatus(
            boolean tenantSigned,
            boolean landlordSigned,
            boolean bothSigned,
            String contractStatus,
            String pdfUrl
    ) {}

    private record PdfInfo(String pdfUrl) {}
}
