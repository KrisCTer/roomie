package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.dto.request.SystemConfigRequest;
import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.SystemConfigResponse;
import com.roomie.services.admin_service.mapper.SystemConfigMapper;
import com.roomie.services.admin_service.service.SystemConfigService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system/config")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemConfigController {
    SystemConfigService systemConfigService;
    SystemConfigMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<SystemConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(systemConfigService.getConfig()), ""));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SystemConfigResponse>> updateConfig(
            @RequestBody SystemConfigRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(systemConfigService.updateConfig(request)), "System configuration updated successfully"));
    }
}
