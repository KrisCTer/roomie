package com.roomie.services.identity_service.controller;

import com.roomie.services.identity_service.dto.request.ApiResponse;
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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InternalUserController {
   UserService userService;

    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }
    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }
    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder().result("User has been deleted").build();
    }

    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, request))
                .build();
    }
    @PostMapping("/{userId}/suspend")
    ApiResponse<String> suspendUser(@PathVariable String userId) {
        userService.suspendUser(userId);
        return ApiResponse.<String>builder().result("User has been suspend").build();
    }
    @PostMapping("/{userId}/ban")
    ApiResponse<String> banUser(@PathVariable String userId) {
        userService.banUser(userId);
        return ApiResponse.<String>builder().result("User has been banned").build();
    }
}
