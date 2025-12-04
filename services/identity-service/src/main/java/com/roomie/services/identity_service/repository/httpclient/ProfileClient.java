package com.roomie.services.identity_service.repository.httpclient;

import com.roomie.services.identity_service.config.AuthenticationRequestInterceptor;
import com.roomie.services.identity_service.config.FeignConfiguration;
import com.roomie.services.identity_service.dto.request.ApiResponse;
import com.roomie.services.identity_service.dto.request.ProfileCreationRequest;
import com.roomie.services.identity_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "profile-service",
        url = "${app.services.profile}",
        configuration = FeignConfiguration.class
)
public interface ProfileClient {

    @PostMapping(value = "/internal/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request);

    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable("userId") String userId);
}