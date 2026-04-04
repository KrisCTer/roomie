package com.roomie.services.identity_service.controller;

import com.nimbusds.jose.JOSEException;
import com.roomie.services.identity_service.dto.request.*;
import com.roomie.services.identity_service.dto.response.ApiResponse;
import com.roomie.services.identity_service.dto.response.AuthenticationResponse;
import com.roomie.services.identity_service.dto.response.IntrospectResponse;
import com.roomie.services.identity_service.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/token")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ApiResponse.success(authenticationService.authenticate(request), "Authenticated successfully");
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException {
        return ApiResponse.success(authenticationService.introspect(request), "Token introspected");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        return ApiResponse.success(authenticationService.refreshToken(request), "Token refreshed");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.success(null, "Logged out successfully");
    }
}