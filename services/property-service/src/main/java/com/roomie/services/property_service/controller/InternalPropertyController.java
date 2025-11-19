package com.roomie.services.property_service.controller;

import com.roomie.services.property_service.dto.request.PropertyRequest;
import com.roomie.services.property_service.dto.response.ApiResponse;
import com.roomie.services.property_service.dto.response.PropertyResponse;
import com.roomie.services.property_service.enums.PropertyStatus;
import com.roomie.services.property_service.service.PropertyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalPropertyController {
    PropertyService propertyService;

    @GetMapping("/pending")
    public ApiResponse<List<PropertyResponse>> getPendingProperties() {
        List<PropertyResponse> list = propertyService.findByStatus(PropertyStatus.PENDING);
        return ApiResponse.success(list, "Pending properties retrieved");
    }

    @PutMapping("/{id}/approve")
    public ApiResponse<Void> approve(@PathVariable String id) {
        propertyService.approve(id);
        return ApiResponse.success(null, "Property approved");
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<Void> reject(@PathVariable String id) {
        propertyService.reject(id);
        return ApiResponse.success(null, "Property rejected");
    }

    @GetMapping("/{id}")
    public ApiResponse<PropertyResponse> get(@PathVariable String id) {
        PropertyResponse response = propertyService.getById(id);
        return ApiResponse.success(response,"Property retrieved");
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable String id, @RequestBody PropertyRequest dto) {
        propertyService.update(id, dto);
        return ApiResponse.success(null, "Property updated");
    }
}
