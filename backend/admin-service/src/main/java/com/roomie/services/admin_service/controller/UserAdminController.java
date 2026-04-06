package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.users.UserResponse;
import com.roomie.services.admin_service.service.UserAdminService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAdminController {
    UserAdminService userService;

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers(),"Get all users successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserDetail(@PathVariable String id) {
        return ApiResponse.success(userService.getUserById(id),"Get user detail successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiResponse.success(null,"Delete user successfully");
    }

    @PostMapping("/{id}/suspend")
    public ApiResponse<String> suspendUser(@PathVariable String id) {
        userService.suspendUser(id);
        return ApiResponse.success(null,"User suspended successfully");
    }

    @PostMapping("/{id}/ban")
    public ApiResponse<String> banUser(@PathVariable String id) {
        userService.banUser(id);
        return ApiResponse.success(null,"User banned successfully");
    }
}
