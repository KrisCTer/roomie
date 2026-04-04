package com.roomie.services.identity_service.controller;

import com.roomie.services.identity_service.dto.response.ApiResponse;
import com.roomie.services.identity_service.dto.request.UserUpdateRequest;
import com.roomie.services.identity_service.dto.response.UserResponse;
import com.roomie.services.identity_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalUserController {
    UserService userService;

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.success(userService.getUsers(), "Fetched all users");
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.success(userService.getUser(userId), "Fetched user");
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<String> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ApiResponse.success("User has been deleted", "User deleted successfully");
    }

    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.success(userService.updateUser(userId, request), "User updated successfully");
    }

    @PostMapping("/{userId}/suspend")
    public ApiResponse<String> suspendUser(@PathVariable String userId) {
        userService.suspendUser(userId);
        return ApiResponse.success("User has been suspended", "User suspended successfully");
    }

    @PostMapping("/{userId}/ban")
    public ApiResponse<String> banUser(@PathVariable String userId) {
        userService.banUser(userId);
        return ApiResponse.success("User has been banned", "User banned successfully");
    }
}
