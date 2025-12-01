package com.roomie.services.contract_service.controller;

import com.roomie.services.contract_service.dto.request.ContractRequest;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.repository.httpclient.FileClient;
import com.roomie.services.contract_service.service.ContractService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
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
    public ResponseEntity<ContractResponse> create(@RequestBody ContractRequest req) {
        log.info("Creating new contract for bookingId={}", req.getBookingId());
        return ResponseEntity.ok(service.create(req));
    }

    /**
     * Lấy thông tin contract
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> get(@PathVariable String id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Tenant ký hợp đồng
     * - Nếu landlord đã ký -> tạo bản FINAL
     * - Nếu chưa -> status = PENDING_SIGNATURE
     */
    @PostMapping("/{id}/sign/tenant")
    public ResponseEntity<ContractResponse> tenantSign(
            @PathVariable String id,
            @RequestBody(required = false) String payload) {
        log.info("Tenant signing contract contractId={}", id);
        return ResponseEntity.ok(service.tenantSign(id, payload));
    }

    /**
     * Landlord ký hợp đồng
     * - Nếu tenant đã ký -> tạo bản FINAL
     * - Nếu chưa -> status = PENDING_SIGNATURE
     */
    @PostMapping("/{id}/sign/landlord")
    public ResponseEntity<ContractResponse> landlordSign(
            @PathVariable String id,
            @RequestBody(required = false) String payload) {
        log.info("Landlord signing contract contractId={}", id);
        return ResponseEntity.ok(service.landlordSign(id, payload));
    }

    /**
     * Download PDF contract
     * URL sẽ tự động trỏ đến bản PREVIEW hoặc FINAL tùy trạng thái
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<?> downloadPdf(@PathVariable String id) {
        return service.getById(id)
                .map(contract -> ResponseEntity.status(302)
                        .header(HttpHeaders.LOCATION, contract.getPdfUrl())
                        .build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Kiểm tra trạng thái ký
     */
    @GetMapping("/{id}/signature-status")
    public ResponseEntity<?> getSignatureStatus(@PathVariable String id) {
        return service.getById(id)
                .map(contract -> ResponseEntity.ok(new SignatureStatus(
                        contract.isTenantSigned(),
                        contract.isLandlordSigned(),
                        contract.isTenantSigned() && contract.isLandlordSigned(),
                        contract.getStatus().toString(),
                        contract.getPdfUrl()
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Inner DTO for signature status
    private record SignatureStatus(
            boolean tenantSigned,
            boolean landlordSigned,
            boolean bothSigned,
            String contractStatus,
            String pdfUrl
    ) {}
}
