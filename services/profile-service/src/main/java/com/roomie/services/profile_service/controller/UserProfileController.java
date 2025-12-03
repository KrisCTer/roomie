package com.roomie.services.profile_service.controller;

import com.roomie.services.profile_service.dto.request.UpdateProfileRequest;
import com.roomie.services.profile_service.dto.response.ApiResponse;
import com.roomie.services.profile_service.dto.response.UserProfileResponse;
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

//    @PostMapping("/users")
//    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request) {
//        return ApiResponse.<UserProfileResponse>builder()
//                .result(userProfileService.createProfile(request))
//                .build();
//    }
    @PostMapping( "/me/idcard")
    public ApiResponse<UserProfileResponse> createProfileFromIDCard(
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ApiResponse.error(400, "Vui lòng upload ảnh CCCD/CMND");
        }

        if (!file.getContentType().startsWith("image/")) {
            return ApiResponse.error(400, "File phải là định dạng ảnh");
        }

        UserProfileResponse result = userProfileService.createProfileFromIDCard(file);
        return ApiResponse.success(result, "Tạo hồ sơ thành công từ CCCD!");
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
    ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyProfile(request))
                .build();
    }

    @PutMapping("/users/avatar")
    ApiResponse<UserProfileResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateAvatar(file))
                .build();
    }

    @PostMapping("/users/search")
    ApiResponse<List<UserProfileResponse>> search(@RequestBody String request) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.search(request))
                .build();
    }
}