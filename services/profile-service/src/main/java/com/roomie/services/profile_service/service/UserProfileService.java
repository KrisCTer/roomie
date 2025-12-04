package com.roomie.services.profile_service.service;

import com.roomie.services.profile_service.dto.request.ProfileCreationRequest;
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
    public UserProfileResponse createProfileFromIDCard(MultipartFile idCardImage) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        // Kiểm tra đã có profile chưa
        if (userProfileRepository.findByUserId(userId).isPresent()) {
            throw new AppException(ErrorCode.PROFILE_ALREADY_EXISTS);
        }

        IDCardInfo idCardInfo = idCardQRService.extractFromFile(idCardImage);

        String fullName = idCardInfo.getFullName().trim();
        String[] nameParts = splitVietnameseFullName(fullName);
        String lastName = nameParts[0];
        String firstName = nameParts[1];

        Gender gender = "Nam".equalsIgnoreCase(idCardInfo.getGender()) ? Gender.MALE
                : "Nữ".equalsIgnoreCase(idCardInfo.getGender()) ? Gender.FEMALE
                : null;

        UserResponse userFromIdentity = identityClient.getUser(userId).getResult();
        String email = userFromIdentity != null ? userFromIdentity.getEmail() : null;
        String phoneNumber = userFromIdentity != null ? userFromIdentity.getPhoneNumber() : null;
        String username = userFromIdentity != null && userFromIdentity.getUsername() != null
                ? userFromIdentity.getUsername()
                : fullName; // fallback to fullName
        // B4: Tạo profile
        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .username(username) // tạm dùng tên thật làm username hiển thị
                .email(email)
                .phoneNumber(phoneNumber)
                .firstName(firstName)
                .lastName(lastName)
                .gender(gender)
                .dob(LocalDate.parse(idCardInfo.getDob())) // yyyy-MM-dd
                .idCardNumber(idCardInfo.getIdNumber())
                .permanentAddress(idCardInfo.getAddress())
                .currentAddress(idCardInfo.getAddress())
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        UserProfile saved = userProfileRepository.save(profile);
        log.info("Created profile from IDCard for userId: {} - {}", userId, fullName);

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
    @CachePut(value = "profile", key = "#userId")
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        userProfileMapper.update(profile, request);
        profile.setUpdatedAt(LocalDateTime.now());

        return userProfileMapper.toUserProfileResponse(userProfileRepository.save(profile));
    }

    // 4. LẤY THÔNG TIN PROFILE
    public UserProfileResponse getMyProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return getByUserId(userId);
    }
    @Cacheable(value = "profile", key = "#userId")
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
    @Cacheable(value = "userSearch", key = "#query", cacheManager = "cacheManager")
    public List<UserProfileResponse> search(String keyword) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<UserProfile> results = (keyword == null || keyword.isBlank())
                ? userProfileRepository.findAll()
                : userProfileRepository.findAllByUsernameLike(keyword);

        return results.stream()
                .filter(p -> !p.getUserId().equals(currentUserId))
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