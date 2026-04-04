package com.roomie.services.billing_service.controller;

import org.springframework.http.ResponseEntity;
import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.dto.response.ContractResponse;
import com.roomie.services.billing_service.dto.response.property.PropertyResponse;
import com.roomie.services.billing_service.entity.Bill;
import com.roomie.services.billing_service.repository.BillRepository;
import com.roomie.services.billing_service.repository.httpclient.ContractClient;
import com.roomie.services.billing_service.repository.httpclient.PropertyClient;
import com.roomie.services.billing_service.service.*;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BillController {

    EnhancedBillingService billingService;
    BillPdfGeneratorService pdfGeneratorService;
    BillRepository billRepository;
    ContractClient contractClient;
    PropertyClient propertyClient;

    BillEmailService emailService;
    BillStatisticsService statisticsService;
    BillBulkOperationsService bulkOperationsService;
    BillExportService exportService;

    @PostMapping
    public ApiResponse<BillResponse> createOrUpdate(
            @Valid @RequestBody BillRequest request) {

        log.info("Creating/Updating bill for contract: {}, month: {}",
                request.getContractId(), request.getBillingMonth());

        BillResponse response = billingService.createOrUpdateBill(request);

        String message = "DRAFT".equals(response.getStatus().toString())
                ? "Bill created successfully. Status: DRAFT"
                : "Bill processed successfully";

        return ApiResponse.success(response, message);
    }

    @PostMapping("/internal/bills")
    public ApiResponse<BillResponse> createOrUpdateInternal(
            @Valid @RequestBody BillRequest request) {

        log.info("Creating/Updating bill for contract: {}, month: {}",
                request.getContractId(), request.getBillingMonth());

        BillResponse response = billingService.createOrUpdateBill(request);

        String message = "DRAFT".equals(response.getStatus().toString())
                ? "Bill created successfully. Status: DRAFT"
                : "Bill processed successfully";

        return ApiResponse.success(response, message);
    }

    @GetMapping("/{id}")
    public ApiResponse<BillResponse> getOne(@PathVariable String id) {
        log.debug("Fetching bill: {}", id);

        BillResponse response = billingService.getBill(id);
        return ApiResponse.success(response,
                "Bill retrieved successfully");
    }

    @GetMapping
    public ApiResponse<List<BillResponse>> getAll() {
        log.debug("Fetching all bills");

        List<BillResponse> list = billingService.getAll();
        return ApiResponse.success(list,
                "All bills retrieved successfully");
    }

    @GetMapping("/contract/{contractId}")
    public ApiResponse<List<BillResponse>> getByContract(
            @PathVariable String contractId) {

        log.debug("Fetching bills for contract: {}", contractId);

        List<BillResponse> list = billingService.getByContract(contractId);
        return ApiResponse.success(list,
                "Contract bills retrieved successfully");
    }

    @GetMapping("/landlord/my-bills")
    public ApiResponse<List<BillResponse>> getMyLandlordBills() {
        log.debug("Fetching landlord bills");

        List<BillResponse> list = billingService.getMyLandlordBills();
        return ApiResponse.success(list,
                "Landlord bills retrieved successfully");
    }

    @GetMapping("/tenant/my-bills")
    public ApiResponse<List<BillResponse>> getMyTenantBills() {
        log.debug("Fetching tenant bills");

        List<BillResponse> list = billingService.getMyTenantBills();
        return ApiResponse.success(list,
                "Tenant bills retrieved successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        log.info("Deleting bill: {}", id);

        billingService.deleteBill(id);
        return ApiResponse.success(null,
                "Bill deleted successfully");
    }

    @PostMapping("/{billId}/send")
    public ApiResponse<BillResponse> sendBill(
            @PathVariable String billId) {

        log.info("Sending bill to tenant: {}", billId);

        BillResponse response = billingService.send(billId);
        return ApiResponse.success(response,
                "Bill sent to tenant successfully. Status changed to PENDING");
    }

    @PostMapping("/{billId}/pay")
    public ApiResponse<BillResponse> payBill(
            @PathVariable String billId,
            @RequestParam String paymentId) {

        log.info("Processing payment for bill: {}, paymentId: {}", billId, paymentId);

        BillResponse response = billingService.pay(billId, paymentId);
        return ApiResponse.success(response,
                "Bill payment processed successfully. Status changed to PAID");
    }

    @GetMapping("/{billId}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable String billId) {
        log.info("Generating PDF invoice for bill: {}", billId);

        try {
            Bill bill = billRepository.findById(billId)
                    .orElseThrow(() -> new RuntimeException("Bill not found: " + billId));
            ContractResponse contract = contractClient.get(bill.getContractId())
                    .getBody()
                    .getResult();
            PropertyResponse property = null;
            try {
                property = propertyClient.get(contract.getPropertyId())
                        .getResult();
            } catch (Exception e) {
                log.warn("Could not fetch property details: {}", e.getMessage());
            }
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(bill, contract, property);

            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=invoice_" + billId.substring(0, 12) + ".pdf");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);

            log.info("PDF invoice generated successfully for bill: {}", billId);

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            log.error("Error generating PDF for bill: {}", billId, e);
            throw new RuntimeException("Failed to generate PDF invoice: " + e.getMessage());
        }
    }

    @GetMapping("/{billId}/pdf/preview")
    public ResponseEntity<Resource> previewPdf(@PathVariable String billId) {
        log.info("Previewing PDF invoice for bill: {}", billId);

        try {
            Bill bill = billRepository.findById(billId)
                    .orElseThrow(() -> new RuntimeException("Bill not found: " + billId));

            ContractResponse contract = contractClient.get(bill.getContractId())
                    .getBody()
                    .getResult();

            PropertyResponse property = null;
            try {
                property = propertyClient.get(contract.getPropertyId())
                        .getResult();
            } catch (Exception e) {
                log.warn("Could not fetch property details");
            }

            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(bill, contract, property);
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=invoice.pdf");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(pdfBytes.length)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            log.error("Error previewing PDF for bill: {}", billId, e);
            throw new RuntimeException("Failed to preview PDF: " + e.getMessage());
        }
    }

    @PostMapping("/{billId}/email")
    public ApiResponse<Void> emailInvoice(
            @PathVariable String billId,
            @RequestParam(required = false) String recipientEmail) {

        log.info("Emailing invoice for bill: {} to: {}",
                billId, recipientEmail != null ? recipientEmail : "tenant email");

        emailService.sendInvoiceEmail(billId, recipientEmail);

        return ApiResponse.success(null,
                "Invoice sent successfully via email");
    }

    @GetMapping("/landlord/stats")
    public ApiResponse<Map<String, Object>> getLandlordStats() {
        log.debug("Fetching landlord billing statistics");

        Map<String, Object> stats = statisticsService.getLandlordStatistics();

        return ApiResponse.success(stats,
                "Landlord statistics retrieved successfully");
    }

    @GetMapping("/tenant/stats")
    public ApiResponse<Map<String, Object>> getTenantStats() {
        log.debug("Fetching tenant billing statistics");

        Map<String, Object> stats = statisticsService.getTenantStatistics();

        return ApiResponse.success(stats,
                "Tenant statistics retrieved successfully");
    }

    @PostMapping("/bulk/generate")
    public ApiResponse<Map<String, Object>> bulkGenerate(
            @RequestBody List<BillRequest> requests) {

        log.info("Bulk generating {} bills", requests.size());

        Map<String, Object> result = bulkOperationsService.bulkGenerateBills(requests);

        return ApiResponse.success(result,
                "Bulk generation completed");
    }

    @PostMapping("/bulk/send")
    public ApiResponse<Map<String, Object>> bulkSend(
            @RequestBody List<String> billIds) {

        log.info("Bulk sending {} bills", billIds.size());

        Map<String, Object> result = bulkOperationsService.bulkSendBills(billIds);

        return ApiResponse.success(result,
                "Bulk send completed");
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportBills(
            @RequestParam(defaultValue = "excel") String format,
            @RequestParam(required = false) String contractId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        log.info("Exporting bills to {}: contractId={}, from={}, to={}",
                format, contractId, from, to);

        Resource resource = exportService.exportBills(format, contractId, from, to);

        String filename = "bills_export." + (format.equals("excel") ? "xlsx" : "csv");
        String contentType = format.equals("excel")
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}