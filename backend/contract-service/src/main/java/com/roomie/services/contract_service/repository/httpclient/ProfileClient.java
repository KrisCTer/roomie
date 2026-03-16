package com.roomie.services.contract_service.repository.httpclient;

import com.roomie.services.contract_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.contract_service.configuration.FeignMultipartConfig;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.profile.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", url = "${app.services.profile}",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface ProfileClient {
    @GetMapping(value = "/internal/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);
}
