package com.roomie.services.profile_service.service;

import com.roomie.services.profile_service.dto.request.ProfileCreationRequest;
import com.roomie.services.profile_service.dto.request.SearchUserRequest;
import com.roomie.services.profile_service.dto.request.UpdateProfileRequest;
import com.roomie.services.profile_service.dto.response.*;
import com.roomie.services.profile_service.entity.UserProfile;
import com.roomie.services.profile_service.enums.AccountStatus;
import com.roomie.services.profile_service.enums.Gender;
import com.roomie.services.profile_service.exception.AppException;
import com.roomie.services.profile_service.exception.ErrorCode;
import com.roomie.services.profile_service.mapper.UserProfileMapper;
import com.roomie.services.profile_service.repository.UserProfileRepository;
import com.roomie.services.profile_service.repository.httpclient.FileClient;
import com.roomie.services.profile_service.repository.httpclient.IdentityClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;
    FileClient fileClient;
    IdentityClient  identityClient;
    IDCardQRService idCardQRService;

    // 1. TẠO PROFILE TỪ CCCD (QR CODE) – TỰ ĐỘNG ĐIỀN THÔNG TIN
    public UserProfileResponse updateProfileFromIDCard(MultipartFile idCardImage) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        // Lấy profile hiện tại (tạo mới nếu chưa có)
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Profile not found for userId: {}. Creating new profile.", userId);
                    return UserProfile.builder()
                            .userId(userId)
                            .status(AccountStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .build();
                });

        // Trích xuất thông tin từ CCCD
        IDCardInfo idCardInfo = idCardQRService.extractFromFile(idCardImage);

        String fullName = idCardInfo.getFullName().trim();
        String[] nameParts = splitVietnameseFullName(fullName);
        String lastName = nameParts[0];
        String firstName = nameParts[1];

        Gender gender = "Nam".equalsIgnoreCase(idCardInfo.getGender()) ? Gender.MALE
                : "Nữ".equalsIgnoreCase(idCardInfo.getGender()) ? Gender.FEMALE
                : null;

        // Lấy thông tin từ Identity Service (nếu chưa có trong profile)
        if (profile.getEmail() == null || profile.getPhoneNumber() == null) {
            try {
                UserResponse userFromIdentity = identityClient.getUser(userId).getResult();
                if (userFromIdentity != null) {
                    if (profile.getEmail() == null) {
                        profile.setEmail(userFromIdentity.getEmail());
                    }
                    if (profile.getPhoneNumber() == null) {
                        profile.setPhoneNumber(userFromIdentity.getPhoneNumber());
                    }
                    if (profile.getUsername() == null) {
                        profile.setUsername(userFromIdentity.getUsername() != null
                                ? userFromIdentity.getUsername()
                                : fullName);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch user from identity service: {}", e.getMessage());
            }
        }

        // Cập nhật thông tin từ CCCD
        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setGender(gender);
        profile.setDob(idCardInfo.getDob()); // yyyy-MM-dd
        profile.setIdCardNumber(idCardInfo.getIdNumber());

        // Chỉ cập nhật địa chỉ nếu chưa có
        if (profile.getPermanentAddress() == null || profile.getPermanentAddress().isEmpty()) {
            profile.setPermanentAddress(idCardInfo.getAddress());
        }
        if (profile.getCurrentAddress() == null || profile.getCurrentAddress().isEmpty()) {
            profile.setCurrentAddress(idCardInfo.getAddress());
        }

        // Fallback username nếu chưa có
        if (profile.getUsername() == null || profile.getUsername().isEmpty()) {
            profile.setUsername(fullName);
        }

        profile.setUpdatedAt(LocalDateTime.now());

        UserProfile saved = userProfileRepository.save(profile);
        log.info("Updated profile from IDCard for userId: {} - {}", userId, fullName);

        return userProfileMapper.toUserProfileResponse(saved);
    }

    // 2. TẠO PROFILE THỦ CÔNG (dành cho admin hoặc fallback)
    public UserProfileResponse createProfile(ProfileCreationRequest request) {

        // 🔥 1. Không sử dụng SecurityContext trong trường hợp đăng ký
        if (request.getUserId() == null) {
            throw new AppException(ErrorCode.USER_ID_REQUIRED);
        }

        // 🔥 2. Không cho tạo trùng profile
        userProfileRepository.findByUserId(request.getUserId())
                .ifPresent(p -> {
                    throw new AppException(ErrorCode.PROFILE_ALREADY_EXISTS);
                });

        // 🔥 3. Mapping dữ liệu
        UserProfile profile = userProfileMapper.toUserProfile(request);

        profile.setUserId(request.getUserId());
        profile.setStatus(AccountStatus.ACTIVE);
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());

        // 🔥 4. Lưu profile
        profile = userProfileRepository.save(profile);

        // 🔥 5. Trả về DTO
        return userProfileMapper.toUserProfileResponse(profile);
    }

    // 3. CẬP NHẬT PROFILE
//    @CachePut(value = "profile", key = "#userId")
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setEmail(request.getEmail());
        profile.setDob(request.getDob());

        userProfileRepository.save(profile);

        return userProfileMapper.toUserProfileResponse(profile);
    }


    // 4. LẤY THÔNG TIN PROFILE
//    @Cacheable(value = "profile", key = "#userId")
    public UserProfileResponse getMyProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return getByUserId(userId);
    }

//    @Cacheable(value = "profile", key = "#userId")
    public UserProfileResponse getByUserId(String userId) {
        System.out.println("Load DB because cache miss");
        return userProfileRepository.findByUserId(userId)
                .map(userProfileMapper::toUserProfileResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
    }

    // 5. UPLOAD AVATAR
//    @CachePut(value = "profile", key = "#userId")
    public UserProfileResponse updateAvatar(MultipartFile file) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        // 1. Upload file lên file-service
        ApiResponse<FileResponse> response = fileClient.uploadFile(file, "avatar", profile.getId());

        FileResponse uploaded = response.getResult();
        if (uploaded == null) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        profile.setAvatar(uploaded.getPublicUrl());
        profile.setUpdatedAt(LocalDateTime.now());
        userProfileRepository.save(profile);

        return userProfileMapper.toUserProfileResponse(profile);

    }


    // 6. TÌM KIẾM USER (dành cho chat, đặt phòng...)
//    @Cacheable(value = "userSearch", key = "#query", cacheManager = "cacheManager")
    public List<UserProfileResponse> search(SearchUserRequest request) {
        String keyword = Optional.ofNullable(request.getKeyword()).orElse("").trim();

        List<UserProfile> list = userProfileRepository.searchUsers(keyword);

        return list.stream()
                .map(userProfileMapper::toUserProfileResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getAllProfiles() {
        var profiles = userProfileRepository.findAll();

        return profiles.stream().map(userProfileMapper::toUserProfileResponse).toList();
    }

    @CacheEvict(value = "profile", key = "#userId")
    public void deleteProfile(String userId) {
        userProfileRepository.deleteByUserId(userId);
    }

    // HELPER: Tách họ tên tiếng Việt chuẩn
    private String[] splitVietnameseFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[]{"", ""};
        }

        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 0) return new String[]{"", ""};
        if (parts.length == 1) return new String[]{parts[0], ""};

        // Họ = từ đầu, Tên = phần còn lại
        String lastName = parts[0];
        String firstName = String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));

        return new String[]{lastName, firstName};
    }
}