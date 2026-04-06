package com.roomie.services.billing_service.controller;

import org.springframework.http.ResponseEntity;
import com.roomie.services.billing_service.dto.request.UtilityRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.UtilityResponse;
import com.roomie.services.billing_service.service.UtilityService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/utility")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UtilityController {

    UtilityService utilityService;

    @PostMapping
    public ApiResponse<UtilityResponse> create(
            @Valid @RequestBody UtilityRequest request) {

        log.info("Creating utility configuration for property: {}, contract: {}",
                request.getPropertyId(), request.getContractId());

        UtilityResponse response = utilityService.createUtility(request);

        String message = request.getContractId() != null
                ? "Contract-specific utility configuration created successfully"
                : "Property-level utility configuration created successfully";

        return ApiResponse.success(response, message);
    }

    @GetMapping("/{id}")
    public ApiResponse<UtilityResponse> getOne(
            @PathVariable String id) {

        log.debug("Fetching utility configuration: {}", id);

        UtilityResponse response = utilityService.getUtility(id);
        return ApiResponse.success(response,
                "Utility configuration retrieved successfully");
    }

    @GetMapping("/property/{propertyId}")
    public ApiResponse<UtilityResponse> getByProperty(
            @PathVariable String propertyId) {

        log.debug("Fetching utility configuration for property: {}", propertyId);

        UtilityResponse response = utilityService.getUtilityByProperty(propertyId);
        return ApiResponse.success(response,
                "Property utility configuration retrieved successfully");
    }

    @GetMapping("/contract/{contractId}")
    public ApiResponse<UtilityResponse> getByContract(
            @PathVariable String contractId) {

        log.debug("Fetching utility configuration for contract: {}", contractId);

        UtilityResponse response = utilityService.getUtilityByContract(contractId);

        if (response != null) {
            return ApiResponse.success(response,
                    "Contract-specific utility configuration found");
        } else {
            return ApiResponse.success(null,
                    "No contract-specific configuration. Using property-level config");
        }
    }

    @GetMapping("/my-utilities")
    public ApiResponse<List<UtilityResponse>> getMyUtilities() {
        log.debug("Fetching my utility configurations");

        List<UtilityResponse> list = utilityService.getMyUtilities();
        return ApiResponse.success(list,
                String.format("Found %d utility configuration(s)", list.size()));
    }

    @PutMapping("/{id}")
    public ApiResponse<UtilityResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UtilityRequest request) {

        log.info("Updating utility configuration: {}", id);

        UtilityResponse response = utilityService.updateUtility(id, request);
        return ApiResponse.success(response,
                "Utility configuration updated successfully");
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivate(
            @PathVariable String id) {

        log.info("Deactivating utility configuration: {}", id);

        utilityService.deactivateUtility(id);
        return ApiResponse.success(null,
                "Utility configuration deactivated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable String id) {

        log.warn("Permanently deleting utility configuration: {}", id);

        utilityService.deleteUtility(id);
        return ApiResponse.success(null,
                "Utility configuration deleted successfully");
    }

    @PostMapping("/bulk")
    public ApiResponse<Object> bulkCreate(
            @RequestBody List<UtilityRequest> requests) {

        log.info("Bulk creating {} utility configurations", requests.size());

        return ApiResponse.success(null,
                "Bulk creation feature coming soon");
    }

    @PostMapping("/bulk/update-pricing")
    public ApiResponse<Object> bulkUpdatePricing(
            @RequestBody Object pricingUpdate) {

        log.info("Bulk updating pricing");

        return ApiResponse.success(null,
                "Bulk pricing update feature coming soon");
    }

    @GetMapping("/templates")
    public ApiResponse<Object> getTemplates() {
        log.debug("Fetching utility templates");

        return ApiResponse.success(null,
                "Templates feature coming soon");
    }

    @PostMapping("/from-template")
    public ApiResponse<UtilityResponse> createFromTemplate(
            @RequestParam String propertyId,
            @RequestParam String template) {

        log.info("Creating utility from template: {} for property: {}",
                template, propertyId);

        return ApiResponse.success(null,
                "Template feature coming soon");
    }

    @GetMapping("/market-average")
    public ApiResponse<Object> getMarketAverage(
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String district) {

        log.debug("Fetching market average for province: {}, district: {}",
                province, district);

        return ApiResponse.success(null,
                "Market average feature coming soon");
    }

    @GetMapping("/{id}/history")
    public ApiResponse<Object> getPricingHistory(
            @PathVariable String id) {

        log.debug("Fetching pricing history for utility: {}", id);

        return ApiResponse.success(null,
                "History feature coming soon");
    }

    @GetMapping("/export")
    public ResponseEntity<Object> export(
            @RequestParam(defaultValue = "csv") String format) {

        log.info("Exporting utility configurations to: {}", format);

        throw new UnsupportedOperationException("Export feature coming soon");
    }

    @GetMapping("/stats")
    public ApiResponse<Object> getStatistics() {
        log.debug("Fetching utility statistics");

        return ApiResponse.success(null,
                "Statistics feature coming soon");
    }

    @PostMapping("/validate")
    public ApiResponse<Object> validate(
            @RequestBody UtilityRequest request) {

        log.debug("Validating utility configuration");

        return ApiResponse.success(null,
                "Validation feature coming soon");
    }

    @GetMapping("/compare")
    public ApiResponse<Object> compare(
            @RequestParam List<String> ids) {

        log.debug("Comparing {} utility configurations", ids.size());

        return ApiResponse.success(null,
                "Comparison feature coming soon");
    }
}