package com.roomie.services.identity_service.controller;

import com.roomie.services.identity_service.dto.response.ApiResponse;
import com.roomie.services.identity_service.dto.request.RoleRequest;
import com.roomie.services.identity_service.dto.response.RoleResponse;
import com.roomie.services.identity_service.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleService roleService;

    @PostMapping
    public ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return ApiResponse.success(roleService.create(request), "Role created successfully");
    }

    @GetMapping
    public ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.success(roleService.getAll(), "Fetched all roles");
    }

    @DeleteMapping("/{role}")
    public ApiResponse<Void> delete(@PathVariable String role) {
        roleService.delete(role);
        return ApiResponse.success(null, "Role deleted successfully");
    }
}