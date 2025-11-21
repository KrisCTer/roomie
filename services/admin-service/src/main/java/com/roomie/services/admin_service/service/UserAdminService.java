package com.roomie.services.admin_service.service;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.users.UserResponse;
import com.roomie.services.admin_service.repository.httpclient.UserClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserAdminService {
    UserClient userClient;
    KafkaTemplate<String,Object> kafka;

    public List<UserResponse> getAllUsers() {
        ApiResponse<List<UserResponse>> response = userClient.getAllUsers();
        return response.getResult();
    }

    public UserResponse getUserById(String id) {
        ApiResponse<UserResponse> res = userClient.getUserById(id);
        return res.getResult();
    }

//    public void updateUser(String id, UserUpdateRequest request) {
//        log.info("Admin updating user id={}", id);
//
//        // Rebuild DTO to identity format
//        UserResponse dto = UserResponse.builder()
//                .id(id)
//                .username()
//                .lastName(request.getLastName())
//                .email(request.getEmail())
//                .dob(request.getDob())
//                .build();
//
//        userClient.updateUser(id, dto);
//    }

    public void deleteUser(String id) {
        userClient.deleteUser(id);
    }

    public void suspendUser(String id) {
        ApiResponse<String> res = userClient.suspendUser(id);

        if (res.getCode() != 1000) {
            throw new RuntimeException("Suspend failed: " + res.getMessage());
        }

        kafka.send("user-events", "UserSuspended:" + id);
    }

    public void banUser(String id) {
        ApiResponse<String> res = userClient.banUser(id);

        if (res.getCode() != 1000) {
            throw new RuntimeException("Ban failed: " + res.getMessage());
        }

        kafka.send("user-events", "UserBanned:" + id);
    }
}
