package com.roomie.services.admin_service.repository.httpclient;

import com.roomie.services.admin_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.users.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "identity-service", url = "${app.services.identity}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface UserClient {
    @GetMapping(value = "/internal/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<UserResponse>> getAllUsers();

    @GetMapping(value ="/internal/users/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserResponse> getUserById(@PathVariable("id") String id);

    @PutMapping(value ="/internal/users/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> updateUser(@PathVariable("id") String id, @RequestBody UserResponse dto);

    @PostMapping(value ="/internal/users/{id}/suspend", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> suspendUser(@PathVariable("id") String id);

    @PostMapping(value ="/internal/users/{id}/ban", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> banUser(@PathVariable("id") String id);

    @DeleteMapping(value ="/internal/users/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> deleteUser(@PathVariable("id") String id);
}
