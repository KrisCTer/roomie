package com.roomie.services.identity_service.controller;

import com.roomie.services.identity_service.dto.response.ApiResponse;
import com.roomie.services.identity_service.dto.request.PermissionRequest;
import com.roomie.services.identity_service.dto.response.PermissionResponse;
import com.roomie.services.identity_service.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {
    PermissionService permissionService;

    @PostMapping
    public ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request) {
        return ApiResponse.success(permissionService.create(request), "Permission created successfully");
    }

    @GetMapping
    public ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.success(permissionService.getAll(), "Fetched all permissions");
    }

    @DeleteMapping("/{permission}")
    public ApiResponse<Void> delete(@PathVariable String permission) {
        permissionService.delete(permission);
        return ApiResponse.success(null, "Permission deleted successfully");
    }
}