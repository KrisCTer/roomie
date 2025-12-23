package com.roomie.services.billing_service.controller;

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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Bill Controller - Complete Implementation
 *
 * Features:
 * - Smart create/update bill (auto-loads utility config, auto-inherits readings)
 * - PDF invoice generation and download
 * - Bill lifecycle management (DRAFT → PENDING → PAID → OVERDUE)
 * - Landlord and Tenant views
 * - Email invoice delivery
 * - Bulk operations
 * - Statistics and reporting
 *
 * Uses:
 * - EnhancedBillingService (smart bill creation)
 * - BillCalculationService (calculations)
 * - BillValidationService (validation)
 * - BillPdfGeneratorService (PDF generation)
 * - UtilityService (auto-load prices)
 */
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

    // ==================== CREATE / UPDATE ====================

    /**
     * Smart Create or Update Bill
     *
     * Features:
     * - Auto-detects if bill exists for the month
     * - Auto-loads utility configuration (electricity/water prices, etc.)
     * - Auto-inherits previous meter readings
     * - Validates meter readings
     * - Calculates all amounts automatically
     *
     * POST /billing
     *
     * Example Request:
     * {
     *   "contractId": "contract_123",
     *   "billingMonth": "2025-01",
     *   "electricityNew": 1150.0,
     *   "waterNew": 220.5,
     *   "monthlyRent": 5000000
     * }
     *
     * Backend auto-fills:
     * - electricityOld (from previous bill)
     * - waterOld (from previous bill)
     * - electricityUnitPrice (from utility config)
     * - waterUnitPrice (from utility config)
     * - internetPrice, parkingPrice, etc. (from utility config)
     * - All calculations
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BillResponse>> createOrUpdate(
            @Valid @RequestBody BillRequest request) {

        log.info("Creating/Updating bill for contract: {}, month: {}",
                request.getContractId(), request.getBillingMonth());

        BillResponse response = billingService.createOrUpdateBill(request);

        String message = "DRAFT".equals(response.getStatus().toString())
                ? "Bill created successfully. Status: DRAFT"
                : "Bill processed successfully";

        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    // ==================== READ ====================

    /**
     * Get bill by ID
     *
     * GET /billing/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getOne(@PathVariable String id) {
        log.debug("Fetching bill: {}", id);

        BillResponse response = billingService.getBill(id);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Bill retrieved successfully"));
    }

    /**
     * Get all bills (Admin only)
     *
     * GET /billing
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponse>>> getAll() {
        log.debug("Fetching all bills");

        List<BillResponse> list = billingService.getAll();
        return ResponseEntity.ok(ApiResponse.success(list,
                "All bills retrieved successfully"));
    }

    /**
     * Get bills by contract
     *
     * GET /billing/contract/{contractId}
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getByContract(
            @PathVariable String contractId) {

        log.debug("Fetching bills for contract: {}", contractId);

        List<BillResponse> list = billingService.getByContract(contractId);
        return ResponseEntity.ok(ApiResponse.success(list,
                "Contract bills retrieved successfully"));
    }

    /**
     * Get my bills as Landlord
     * Returns all bills for properties owned by current landlord
     *
     * GET /billing/landlord/my-bills
     */
    @GetMapping("/landlord/my-bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getMyLandlordBills() {
        log.debug("Fetching landlord bills");

        List<BillResponse> list = billingService.getMyLandlordBills();
        return ResponseEntity.ok(ApiResponse.success(list,
                "Landlord bills retrieved successfully"));
    }

    /**
     * Get my bills as Tenant
     * Returns all bills for contracts where current user is tenant
     *
     * GET /billing/tenant/my-bills
     */
    @GetMapping("/tenant/my-bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getMyTenantBills() {
        log.debug("Fetching tenant bills");

        List<BillResponse> list = billingService.getMyTenantBills();
        return ResponseEntity.ok(ApiResponse.success(list,
                "Tenant bills retrieved successfully"));
    }

    // ==================== DELETE ====================

    /**
     * Delete bill
     * Only bills in DRAFT status can be deleted
     *
     * DELETE /billing/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        log.info("Deleting bill: {}", id);

        billingService.deleteBill(id);
        return ResponseEntity.ok(ApiResponse.success(null,
                "Bill deleted successfully"));
    }

    // ==================== STATE TRANSITIONS ====================

    /**
     * Send bill to tenant
     * Status transition: DRAFT → PENDING
     *
     * POST /billing/{billId}/send
     */
    @PostMapping("/{billId}/send")
    public ResponseEntity<ApiResponse<BillResponse>> sendBill(
            @PathVariable String billId) {

        log.info("Sending bill to tenant: {}", billId);

        BillResponse response = billingService.send(billId);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Bill sent to tenant successfully. Status changed to PENDING"));
    }

    /**
     * Mark bill as paid
     * Status transition: PENDING → PAID
     *
     * POST /billing/{billId}/pay?paymentId={paymentId}
     *
     * @param billId Bill ID
     * @param paymentId Payment transaction ID from payment gateway
     */
    @PostMapping("/{billId}/pay")
    public ResponseEntity<ApiResponse<BillResponse>> payBill(
            @PathVariable String billId,
            @RequestParam String paymentId) {

        log.info("Processing payment for bill: {}, paymentId: {}", billId, paymentId);

        BillResponse response = billingService.pay(billId, paymentId);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Bill payment processed successfully. Status changed to PAID"));
    }

    // ==================== PDF GENERATION ====================

    /**
     * Download bill as PDF invoice
     *
     * Features:
     * - Professional invoice template
     * - Company logo and branding
     * - Contract and property details
     * - Itemized breakdown (electricity, water, services)
     * - Payment information
     * - QR code for payment
     *
     * GET /billing/{billId}/pdf
     *
     * Returns: application/pdf
     */
    @GetMapping("/{billId}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable String billId) {
        log.info("Generating PDF invoice for bill: {}", billId);

        try {
            // Get bill
            Bill bill = billRepository.findById(billId)
                    .orElseThrow(() -> new RuntimeException("Bill not found: " + billId));

            // Get contract
            ContractResponse contract = contractClient.get(bill.getContractId())
                    .getBody()
                    .getResult();

            // Get property
            PropertyResponse property = null;
            try {
                property = propertyClient.get(contract.getPropertyId())
                        .getResult();
            } catch (Exception e) {
                log.warn("Could not fetch property details: {}", e.getMessage());
            }

            // Generate PDF
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(bill, contract, property);

            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            // Set headers for download
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

    /**
     * Preview PDF in browser (inline, not download)
     *
     * GET /billing/{billId}/pdf/preview
     */
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

            // For preview, use inline disposition
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

    // ==================== EMAIL INVOICE ====================

    /**
     * Email invoice to tenant
     *
     * POST /billing/{billId}/email
     * POST /billing/{billId}/email?recipientEmail=custom@email.com
     *
     * If recipientEmail not provided, uses tenant email from contract
     */
    @PostMapping("/{billId}/email")
    public ResponseEntity<ApiResponse<Void>> emailInvoice(
            @PathVariable String billId,
            @RequestParam(required = false) String recipientEmail) {

        log.info("Emailing invoice for bill: {} to: {}",
                billId, recipientEmail != null ? recipientEmail : "tenant email");

        emailService.sendInvoiceEmail(billId, recipientEmail);

        return ResponseEntity.ok(ApiResponse.success(null,
                "Invoice sent successfully via email"));
    }

    // ==================== STATISTICS ====================

    /**
     * Get billing statistics for landlord
     *
     * GET /billing/landlord/stats
     *
     * Returns:
     * - Total bills count
     * - Bills by status (draft, pending, paid, overdue)
     * - Total revenue
     * - Outstanding amount
     * - Average bill amount
     * - Payment rate
     */
    @GetMapping("/landlord/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLandlordStats() {
        log.debug("Fetching landlord billing statistics");

        Map<String, Object> stats = statisticsService.getLandlordStatistics();

        return ResponseEntity.ok(ApiResponse.success(stats,
                "Landlord statistics retrieved successfully"));
    }

    /**
     * Get billing statistics for tenant
     *
     * GET /billing/tenant/stats
     *
     * Returns:
     * - Total bills count
     * - Pending bills
     * - Paid bills
     * - Total amount paid
     * - Outstanding amount
     * - Payment history
     */
    @GetMapping("/tenant/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTenantStats() {
        log.debug("Fetching tenant billing statistics");

        Map<String, Object> stats = statisticsService.getTenantStatistics();

        return ResponseEntity.ok(ApiResponse.success(stats,
                "Tenant statistics retrieved successfully"));
    }

    // ==================== BULK OPERATIONS ====================

    /**
     * Generate bills for multiple contracts
     * Useful for monthly batch bill generation
     *
     * POST /billing/bulk/generate
     *
     * Request body: List of BillRequest
     *
     * Returns: Summary of results (success count, failed count, errors)
     */
    @PostMapping("/bulk/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkGenerate(
            @RequestBody List<BillRequest> requests) {

        log.info("Bulk generating {} bills", requests.size());

        Map<String, Object> result = bulkOperationsService.bulkGenerateBills(requests);

        return ResponseEntity.ok(ApiResponse.success(result,
                "Bulk generation completed"));
    }

    /**
     * Send multiple bills at once
     *
     * POST /billing/bulk/send
     *
     * Request body: List of bill IDs
     */
    @PostMapping("/bulk/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkSend(
            @RequestBody List<String> billIds) {

        log.info("Bulk sending {} bills", billIds.size());

        Map<String, Object> result = bulkOperationsService.bulkSendBills(billIds);

        return ResponseEntity.ok(ApiResponse.success(result,
                "Bulk send completed"));
    }

    /**
     * Export bills to Excel/CSV
     *
     * GET /billing/export?format=excel&contractId=xxx&from=2025-01&to=2025-12
     *
     * Query params:
     * - format: excel or csv
     * - contractId (optional): filter by contract
     * - from (optional): start month
     * - to (optional): end month
     */
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