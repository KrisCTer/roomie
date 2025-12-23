package com.roomie.services.identity_service.service;

import com.roomie.services.identity_service.dto.event.NotificationEvent;
import com.roomie.services.identity_service.dto.request.UserCreationRequest;
import com.roomie.services.identity_service.dto.request.UserUpdateRequest;
import com.roomie.services.identity_service.dto.response.UserResponse;
import com.roomie.services.identity_service.entity.Role;
import com.roomie.services.identity_service.entity.User;
import com.roomie.services.identity_service.enums.UserRole;
import com.roomie.services.identity_service.exception.AppException;
import com.roomie.services.identity_service.exception.ErrorCode;
import com.roomie.services.identity_service.mapper.ProfileMapper;
import com.roomie.services.identity_service.mapper.UserMapper;
import com.roomie.services.identity_service.repository.RoleRepository;
import com.roomie.services.identity_service.repository.UserRepository;
import com.roomie.services.identity_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        Set<UserRole> roleNames = request.getRoles();
        if (roleNames == null || roleNames.isEmpty()) {
            roleNames = Set.of(UserRole.USER); // default role
        }

        HashSet<Role> roles = new HashSet<>();
        roleNames.forEach(roleName -> {
            roleRepository.findById(String.valueOf(roleName))
                    .ifPresentOrElse(roles::add,
                            () -> { throw new AppException(ErrorCode.ROLE_NOT_FOUND); });
        });
        user.setRoles(roles);
        user.setEmailVerified(false);
        user.setIsActive(true);
        user.setIsBanned(false);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        var profileRequest = profileMapper.toProfileCreationRequest(request);
        profileRequest.setUserId(user.getId());

        var profile = profileClient.createProfile(profileRequest);

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(request.getEmail())
                .subject("Welcome to Roomie")
                .body("Hello, " + request.getUsername())
                .build();

        // Publish message to kafka
        kafkaTemplate.send("notification-delivery", notificationEvent);

        var userCreationResponse = userMapper.toUserResponse(user);
        userCreationResponse.setId(profile.getResult().getId());

        return userCreationResponse;
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }
    @PreAuthorize("hasRole('ADMIN')")
    public void suspendUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsActive(false);
        userRepository.save(user);
    }
    @PreAuthorize("hasRole('ADMIN')")
    public void banUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsBanned(true);
        user.setIsActive(false);
        userRepository.save(user);
    }
}
