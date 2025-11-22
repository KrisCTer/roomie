package com.roomie.services.chat_service.repository.httpclient;

import com.roomie.services.chat_service.dto.request.IntrospectRequest;
import com.roomie.services.chat_service.dto.response.ApiResponse;
import com.roomie.services.chat_service.dto.response.IntrospectResponse;
import com.roomie.services.chat_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "identity-service", url = "${app.services.identity}")
public interface IdentityClient {
    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest introspectRequest);
}
