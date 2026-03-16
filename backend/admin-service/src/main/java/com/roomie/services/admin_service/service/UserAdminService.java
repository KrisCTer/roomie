package com.roomie.services.admin_service.service;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.users.UserResponse;
import com.roomie.services.admin_service.exception.AppException;
import com.roomie.services.admin_service.exception.ErrorCode;
import com.roomie.services.admin_service.repository.httpclient.UserClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserAdminService {
    UserClient userClient;
    KafkaTemplate<String,Object> kafka;
    RedisTemplate<String, Object> redis;

    public List<UserResponse> getAllUsers() {
        String key = "users:all";

        List<UserResponse> cached = (List<UserResponse>) redis.opsForValue().get(key);
        if (cached != null) return cached;

        List<UserResponse> list = userClient.getAllUsers().getResult();

        redis.opsForValue().set(key, list, 10, TimeUnit.SECONDS);

        return list;
    }

    public UserResponse getUserById(String id) {
        String key = "user:" + id;

        UserResponse cached = (UserResponse) redis.opsForValue().get(key);
        if (cached != null) return cached;

        UserResponse user = userClient.getUserById(id).getResult();

        redis.opsForValue().set(key, user, 30, TimeUnit.SECONDS);

        return user;
    }

//    public void updateUser(String contractId, UserUpdateRequest request) {
//        log.info("Admin updating user contractId={}", contractId);
//
//        // Rebuild DTO to identity format
//        UserResponse dto = UserResponse.builder()
//                .contractId(contractId)
//                .username()
//                .lastName(request.getLastName())
//                .email(request.getEmail())
//                .dob(request.getDob())
//                .build();
//
//        userClient.updateUser(contractId, dto);
//    }

    public void deleteUser(String id) {
        userClient.deleteUser(id);
        redis.delete("users:all");
        redis.delete("user:" + id);
    }

    public void suspendUser(String id) {
        ApiResponse<String> res = userClient.suspendUser(id);
        if (res.getCode() != 1000)
            throw new AppException(ErrorCode.SUSPEND_FAILED,res.getMessage());

        redis.delete("users:all");
        redis.delete("user:" + id);

        kafka.send("user-events", "UserSuspended:" + id);
    }

    public void banUser(String id) {
        ApiResponse<String> res = userClient.banUser(id);
        if (res.getCode() != 1000)
            throw new AppException(ErrorCode.BAN_FAILED,res.getMessage());

        redis.delete("users:all");
        redis.delete("user:" + id);

        kafka.send("user-events", "UserBanned:" + id);
    }
}
