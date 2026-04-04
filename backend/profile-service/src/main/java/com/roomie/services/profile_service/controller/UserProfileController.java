package com.roomie.services.profile_service.controller;

import com.roomie.services.profile_service.dto.request.SearchUserRequest;
import com.roomie.services.profile_service.dto.request.UpdateProfileRequest;
import com.roomie.services.profile_service.dto.response.ApiResponse;
import com.roomie.services.profile_service.dto.response.UserProfileResponse;
import com.roomie.services.profile_service.exception.AppException;
import com.roomie.services.profile_service.exception.ErrorCode;
import com.roomie.services.profile_service.service.UserProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    @PutMapping("/me/id-card")
    public ApiResponse<UserProfileResponse> updateProfileFromIDCard(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
        if (!file.getContentType().startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
        return ApiResponse.success(userProfileService.updateProfileFromIDCard(file), "Profile updated from ID card successfully");
    }

    @GetMapping("/users/{profileId}")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable String profileId) {
        return ApiResponse.success(userProfileService.getByUserId(profileId), "Fetched profile successfully");
    }

    @GetMapping("/users")
    public ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        return ApiResponse.success(userProfileService.getAllProfiles(), "Fetched all profiles");
    }

    @GetMapping("/users/my-profile")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.success(userProfileService.getMyProfile(), "Fetched my profile");
    }

    @PutMapping("/users/my-profile")
    public ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userProfileService.updateMyProfile(request), "Profile updated successfully");
    }

    @PutMapping("/users/avatar")
    public ApiResponse<UserProfileResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(userProfileService.updateAvatar(file), "Avatar updated successfully");
    }

    @PostMapping("/search")
    public ApiResponse<List<UserProfileResponse>> search(@RequestBody SearchUserRequest request) {
        return ApiResponse.success(userProfileService.search(request), "Search completed successfully");
    }
}