package com.roomie.services.property_service.controller;

import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.ApiResponse;
import com.roomie.services.property_service.dto.response.PropertyResponse;
import jakarta.validation.Valid;
import lombok.*;
import com.roomie.services.property_service.service.PropertyService;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PropertyController {

    PropertyService propertyService;

    @PostMapping
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(@RequestBody @Valid PropertyRequest request) {
        PropertyResponse property = propertyService.create(request);
        return ResponseEntity.ok(ApiResponse.success(property, "Property created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> update(@PathVariable String id, @RequestBody @Valid PropertyRequest request) {
        PropertyResponse updated = propertyService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Property updated successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getById(@PathVariable String id) {
        PropertyResponse property = propertyService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(property, "Property fetched successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        propertyService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Property deleted successfully"));
    }

    @GetMapping("/properties")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<PropertyResponse> list = propertyService.findAll(page, size);
        return ResponseEntity.ok(ApiResponse.success(list, "Property list fetched successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> search(@RequestParam String q) {
        List<PropertyResponse> list = propertyService.searchFullText(q);
        return ResponseEntity.ok(ApiResponse.success(list, "Search results fetched successfully"));
    }

    @GetMapping("/by-price")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> byPrice(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max) {
        List<PropertyResponse> list = propertyService.findByPriceRange(min, max);
        return ResponseEntity.ok(ApiResponse.success(list, "Properties fetched by price range"));
    }

    @GetMapping("/by-province")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> byProvince(@RequestParam String province) {
        List<PropertyResponse> list = propertyService.findByProvince(province);
        return ResponseEntity.ok(ApiResponse.success(list, "Properties fetched by province"));
    }
}