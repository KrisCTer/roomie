package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.property.PropertyResponse;
import com.roomie.services.admin_service.service.PropertyAdminService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PropertyAdminController {

    PropertyAdminService propertyAdminService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<PropertyResponse>>> getPendingProperties() {
        return ResponseEntity.ok(ApiResponse.success(propertyAdminService.getPendingProperties(),"Pending properties retrieved"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveProperty(@PathVariable String id) {
        propertyAdminService.approveProperty(id);
        return ResponseEntity.ok(ApiResponse.success(null,"Property approved"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectProperty(@PathVariable String id) {
        propertyAdminService.rejectProperty(id);
        return ResponseEntity.ok(ApiResponse.success(null,"Property rejected"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getProperty(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(propertyAdminService.getProperty(id),"Property retrieved"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateProperty(@PathVariable String id, @RequestBody PropertyResponse dto) {
        propertyAdminService.updateProperty(id, dto);
        return ResponseEntity.ok(ApiResponse.success(null,"Property updated"));
    }
}
