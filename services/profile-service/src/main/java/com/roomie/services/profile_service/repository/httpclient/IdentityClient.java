package com.roomie.services.profile_service.repository.httpclient;

import com.roomie.services.profile_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.profile_service.configuration.FeignMultipartConfig;
import com.roomie.services.profile_service.dto.response.ApiResponse;
import com.roomie.services.profile_service.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service", url = "${app.services.identity}",
        configuration = { FeignMultipartConfig.class,AuthenticationRequestInterceptor.class })
public interface IdentityClient {
    @GetMapping(value = "/internal/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId);
}