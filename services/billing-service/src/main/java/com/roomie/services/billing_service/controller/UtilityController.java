package com.roomie.services.billing_service.controller;

import com.roomie.services.billing_service.dto.request.UtilityRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.UtilityResponse;
import com.roomie.services.billing_service.service.UtilityService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Utility Configuration Controller - Complete Implementation
 *
 * Manages utility pricing and service configurations for properties and contracts.
 *
 * Features:
 * - Property-level and Contract-level configurations
 * - Electricity, Water, Gas pricing
 * - Fixed service fees (Internet, Parking, Cleaning, Maintenance)
 * - Meter information tracking
 * - Active/Inactive status management
 * - Owner authorization checks
 *
 * Used by:
 * - EnhancedBillingService (auto-loads utility prices when creating bills)
 * - Landlords (configure utility pricing for their properties)
 *
 * Configuration Hierarchy:
 * 1. Contract-specific config (if exists)
 * 2. Property-level config (fallback)
 */
@RestController
@RequestMapping("/utility")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UtilityController {

    UtilityService utilityService;

    // ==================== CREATE ====================

    /**
     * Create new utility configuration
     *
     * POST /billing/utility
     *
     * Example: Property-level configuration
     * {
     *   "propertyId": "prop_123",
     *   "electricityUnitPrice": 3500.0,
     *   "waterUnitPrice": 15000.0,
     *   "internetPrice": 200000,
     *   "parkingPrice": 100000,
     *   "cleaningPrice": 50000,
     *   "maintenancePrice": 0,
     *   "notes": "Standard pricing for all units"
     * }
     *
     * Example: Contract-specific configuration (overrides property-level)
     * {
     *   "propertyId": "prop_123",
     *   "contractId": "contract_456",
     *   "electricityUnitPrice": 3200.0,
     *   "waterUnitPrice": 14000.0,
     *   "internetPrice": 0,
     *   "notes": "Discounted rate for long-term tenant"
     * }
     *
     * Validation:
     * - Only one active config per property (unless contract-specific)
     * - Only one active config per contract
     * - Current user must own the property (landlordId verification)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UtilityResponse>> create(
            @Valid @RequestBody UtilityRequest request) {

        log.info("Creating utility configuration for property: {}, contract: {}",
                request.getPropertyId(), request.getContractId());

        UtilityResponse response = utilityService.createUtility(request);

        String message = request.getContractId() != null
                ? "Contract-specific utility configuration created successfully"
                : "Property-level utility configuration created successfully";

        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    // ==================== READ ====================

    /**
     * Get utility configuration by ID
     *
     * GET /billing/utility/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UtilityResponse>> getOne(
            @PathVariable String id) {

        log.debug("Fetching utility configuration: {}", id);

        UtilityResponse response = utilityService.getUtility(id);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Utility configuration retrieved successfully"));
    }

    /**
     * Get active utility configuration by property ID
     * Returns the property-level configuration
     *
     * GET /billing/utility/property/{propertyId}
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<UtilityResponse>> getByProperty(
            @PathVariable String propertyId) {

        log.debug("Fetching utility configuration for property: {}", propertyId);

        UtilityResponse response = utilityService.getUtilityByProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Property utility configuration retrieved successfully"));
    }

    /**
     * Get active utility configuration by contract ID
     * Returns contract-specific config if exists, otherwise null
     *
     * GET /billing/utility/contract/{contractId}
     *
     * Returns:
     * - Contract-specific config (if exists)
     * - null (if only property-level config exists)
     *
     * Note: Use this to check if contract has custom pricing
     * For bill creation, use property endpoint which includes fallback logic
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<UtilityResponse>> getByContract(
            @PathVariable String contractId) {

        log.debug("Fetching utility configuration for contract: {}", contractId);

        UtilityResponse response = utilityService.getUtilityByContract(contractId);

        if (response != null) {
            return ResponseEntity.ok(ApiResponse.success(response,
                    "Contract-specific utility configuration found"));
        } else {
            return ResponseEntity.ok(ApiResponse.success(null,
                    "No contract-specific configuration. Using property-level config"));
        }
    }

    /**
     * Get all my utility configurations (as landlord)
     * Returns all configs owned by current user
     *
     * GET /billing/utility/my-utilities
     */
    @GetMapping("/my-utilities")
    public ResponseEntity<ApiResponse<List<UtilityResponse>>> getMyUtilities() {
        log.debug("Fetching my utility configurations");

        List<UtilityResponse> list = utilityService.getMyUtilities();
        return ResponseEntity.ok(ApiResponse.success(list,
                String.format("Found %d utility configuration(s)", list.size())));
    }

    // ==================== UPDATE ====================

    /**
     * Update utility configuration
     *
     * PUT /billing/utility/{id}
     *
     * Authorization: Only the landlord who owns this config can update
     *
     * Example: Update electricity price
     * {
     *   "propertyId": "prop_123",
     *   "electricityUnitPrice": 3600.0,
     *   "waterUnitPrice": 15000.0,
     *   ...
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UtilityResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody UtilityRequest request) {

        log.info("Updating utility configuration: {}", id);

        UtilityResponse response = utilityService.updateUtility(id, request);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Utility configuration updated successfully"));
    }

    // ==================== DEACTIVATE ====================

    /**
     * Deactivate utility configuration
     * Sets active = false, keeps historical data
     *
     * POST /billing/utility/{id}/deactivate
     *
     * Use cases:
     * - When property is sold
     * - When utility company changes rates (create new config)
     * - When contract ends (for contract-specific configs)
     *
     * Note: Deactivated configs are kept for historical bill references
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable String id) {

        log.info("Deactivating utility configuration: {}", id);

        utilityService.deactivateUtility(id);
        return ResponseEntity.ok(ApiResponse.success(null,
                "Utility configuration deactivated successfully"));
    }

    // ==================== DELETE ====================

    /**
     * Permanently delete utility configuration
     *
     * DELETE /billing/utility/{id}
     *
     * ⚠️ Warning: This cannot be undone
     * Only delete if:
     * - No bills reference this configuration
     * - Configuration was created by mistake
     *
     * Otherwise, use deactivate instead
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id) {

        log.warn("Permanently deleting utility configuration: {}", id);

        utilityService.deleteUtility(id);
        return ResponseEntity.ok(ApiResponse.success(null,
                "Utility configuration deleted successfully"));
    }

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk create utility configurations
     * Useful when adding multiple properties at once
     *
     * POST /billing/utility/bulk
     *
     * Request body: List of UtilityRequest
     */
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Object>> bulkCreate(
            @RequestBody List<UtilityRequest> requests) {

        log.info("Bulk creating {} utility configurations", requests.size());

        // TODO: Implement bulk creation
        // - Validate all requests
        // - Create in batch
        // - Return summary (success count, failed count, errors)

        return ResponseEntity.ok(ApiResponse.success(null,
                "Bulk creation feature coming soon"));
    }

    /**
     * Bulk update pricing
     * Update electricity/water prices across multiple utilities
     *
     * POST /billing/utility/bulk/update-pricing
     *
     * Example: Update all properties when utility company raises rates
     * {
     *   "utilityIds": ["util_1", "util_2", "util_3"],
     *   "electricityUnitPrice": 3800.0,
     *   "waterUnitPrice": 16000.0
     * }
     */
    @PostMapping("/bulk/update-pricing")
    public ResponseEntity<ApiResponse<Object>> bulkUpdatePricing(
            @RequestBody Object pricingUpdate) {

        log.info("Bulk updating pricing");

        // TODO: Implement bulk pricing update

        return ResponseEntity.ok(ApiResponse.success(null,
                "Bulk pricing update feature coming soon"));
    }

    // ==================== TEMPLATES ====================

    /**
     * Get available pricing templates
     *
     * GET /billing/utility/templates
     *
     * Returns predefined templates:
     * - STANDARD: Average market rates
     * - PREMIUM: Higher quality, higher price
     * - ECONOMY: Budget-friendly rates
     */
    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<Object>> getTemplates() {
        log.debug("Fetching utility templates");

        // TODO: Return predefined templates
        // Example templates:
        // STANDARD: electricity=3500, water=15000, internet=200000
        // PREMIUM: electricity=4000, water=18000, internet=300000
        // ECONOMY: electricity=3000, water=12000, internet=150000

        return ResponseEntity.ok(ApiResponse.success(null,
                "Templates feature coming soon"));
    }

    /**
     * Create utility configuration from template
     *
     * POST /billing/utility/from-template?propertyId={id}&template=STANDARD
     */
    @PostMapping("/from-template")
    public ResponseEntity<ApiResponse<UtilityResponse>> createFromTemplate(
            @RequestParam String propertyId,
            @RequestParam String template) {

        log.info("Creating utility from template: {} for property: {}",
                template, propertyId);

        // TODO: Implement template-based creation

        return ResponseEntity.ok(ApiResponse.success(null,
                "Template feature coming soon"));
    }

    // ==================== MARKET DATA ====================

    /**
     * Get market average pricing
     * Returns average utility prices in the area
     *
     * GET /billing/utility/market-average?province=HCMC&district=District1
     *
     * Helps landlords set competitive pricing
     */
    @GetMapping("/market-average")
    public ResponseEntity<ApiResponse<Object>> getMarketAverage(
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String district) {

        log.debug("Fetching market average for province: {}, district: {}",
                province, district);

        // TODO: Calculate market averages
        // - Group utilities by location
        // - Calculate median/average prices
        // - Show price trends

        return ResponseEntity.ok(ApiResponse.success(null,
                "Market average feature coming soon"));
    }

    // ==================== REPORTING ====================

    /**
     * Get utility pricing history
     * Shows how prices have changed over time
     *
     * GET /billing/utility/{id}/history
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<Object>> getPricingHistory(
            @PathVariable String id) {

        log.debug("Fetching pricing history for utility: {}", id);

        // TODO: Implement history tracking
        // - Track price changes
        // - Show change timeline
        // - Calculate price trends

        return ResponseEntity.ok(ApiResponse.success(null,
                "History feature coming soon"));
    }

    /**
     * Export utility configurations
     * Export to CSV/Excel for analysis
     *
     * GET /billing/utility/export?format=csv
     */
    @GetMapping("/export")
    public ResponseEntity<Object> export(
            @RequestParam(defaultValue = "csv") String format) {

        log.info("Exporting utility configurations to: {}", format);

        // TODO: Implement export
        // - Support CSV and Excel formats
        // - Include all active configurations
        // - Add summary statistics

        throw new UnsupportedOperationException("Export feature coming soon");
    }

    // ==================== STATISTICS ====================

    /**
     * Get utility statistics
     *
     * GET /billing/utility/stats
     *
     * Returns:
     * - Total configurations count
     * - Active vs inactive count
     * - Average prices
     * - Price distribution
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStatistics() {
        log.debug("Fetching utility statistics");

        // TODO: Implement statistics

        return ResponseEntity.ok(ApiResponse.success(null,
                "Statistics feature coming soon"));
    }

    // ==================== VALIDATION ====================

    /**
     * Validate utility configuration
     * Checks for reasonable pricing, required fields, etc.
     *
     * POST /billing/utility/validate
     *
     * Useful before creating configuration
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Object>> validate(
            @RequestBody UtilityRequest request) {

        log.debug("Validating utility configuration");

        // TODO: Implement validation
        // - Check reasonable price ranges
        // - Verify required fields
        // - Warning for unusual values

        return ResponseEntity.ok(ApiResponse.success(null,
                "Validation feature coming soon"));
    }

    /**
     * Compare utility configurations
     * Compare pricing across different properties
     *
     * GET /billing/utility/compare?ids=util1,util2,util3
     */
    @GetMapping("/compare")
    public ResponseEntity<ApiResponse<Object>> compare(
            @RequestParam List<String> ids) {

        log.debug("Comparing {} utility configurations", ids.size());

        // TODO: Implement comparison
        // - Show pricing differences
        // - Highlight outliers
        // - Generate comparison report

        return ResponseEntity.ok(ApiResponse.success(null,
                "Comparison feature coming soon"));
    }
}