package com.roomie.services.profile_service.controller;

import com.roomie.services.profile_service.dto.response.ApiResponse;
import com.roomie.services.profile_service.dto.response.IDCardInfo;
import com.roomie.services.profile_service.service.IDCardQRService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/idcard")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IDCardController {
    IDCardQRService idCardQRService;

    @PostMapping("/tenant")
    public ApiResponse<IDCardInfo> uploadIdCardTenant(
            @RequestPart("file") MultipartFile file
    ) {
        IDCardInfo info = idCardQRService.extractFromFile(file);
        return ApiResponse.success(info,"Upload IDCard for Tenant successfully");
    }
    @PostMapping("/landlord")
    public ApiResponse<IDCardInfo> uploadIdCardLandlord(
            @RequestPart("file") MultipartFile file
    ) {
        IDCardInfo info = idCardQRService.extractFromFile(file);
        return ApiResponse.success(info,"Upload IDCard for Landlord successfully");
    }
}
