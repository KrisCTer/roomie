package com.roomie.services.profile_service.controller;

import com.roomie.services.profile_service.dto.request.SearchUserRequest;
import com.roomie.services.profile_service.dto.request.UpdateProfileRequest;
import com.roomie.services.profile_service.dto.response.ApiResponse;
import com.roomie.services.profile_service.dto.response.UserProfileResponse;
import com.roomie.services.profile_service.service.UserProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    //    @PostMapping("/users")
//    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request) {
//        return ApiResponse.<UserProfileResponse>builder()
//                .result(userProfileService.createProfile(request))
//                .build();
//    }
    @PutMapping("/me/id-card")
    public ApiResponse<UserProfileResponse> updateProfileFromIDCard(
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ApiResponse.error(400, "Please upload a photo of your Citizen Identification Card/National Identity Card.");
        }

        if (!file.getContentType().startsWith("image/")) {
            return ApiResponse.error(400, "The file must be in image format.");
        }

        UserProfileResponse result = userProfileService.updateProfileFromIDCard(file);
        return ApiResponse.success(result, "Profile update from Citizen Identification Card successful!");
    }

    @GetMapping("/users/{profileId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String profileId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getByUserId(profileId))
                .build();
    }

    @GetMapping("/users")
    ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles())
                .build();
    }

    @GetMapping("/users/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @PutMapping("/users/my-profile")
    public ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userProfileService.updateMyProfile(request),"Update user successful");
    }


    @PutMapping("/users/avatar")
    ApiResponse<UserProfileResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateAvatar(file))
                .build();
    }

    @PostMapping("/search")
    public ApiResponse<List<UserProfileResponse>> search(@RequestBody SearchUserRequest request) {
        return ApiResponse.success(userProfileService.search(request),"Search User successful");
    }
}