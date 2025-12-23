package com.roomie.services.identity_service.config;

import com.roomie.services.identity_service.dto.request.UserCreationRequest;
import com.roomie.services.identity_service.dto.response.UserResponse;
import com.roomie.services.identity_service.entity.Role;
import com.roomie.services.identity_service.entity.User;
import com.roomie.services.identity_service.enums.UserRole;
import com.roomie.services.identity_service.exception.AppException;
import com.roomie.services.identity_service.exception.ErrorCode;
import com.roomie.services.identity_service.repository.RoleRepository;
import com.roomie.services.identity_service.repository.UserRepository;
import com.roomie.services.identity_service.service.AuthenticationService;
import com.roomie.services.identity_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    final UserRepository userRepository;
    final RoleRepository roleRepository;
    final PasswordEncoder passwordEncoder;
    final AuthenticationService authenticationService;
    final UserService userService;

    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String provider = getProvider(request);

        log.info("OAuth2 login successful - Email: {}, Provider: {}", email, provider);

        try {
            // Find or create user
            User user = userRepository.findByUsernameWithRoles(email)
                    .orElseGet(() -> createNewUser(email, name, provider));

            // Generate JWT token
            String token = authenticationService.generateTokenForOAuth2(user);

            // Redirect to frontend with token
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", token)
                    .queryParam("email", email)
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            log.error("Error during OAuth2 authentication", e);
            response.sendRedirect(redirectUri + "?error=authentication_failed");
        }
    }

    private User createNewUser(String email, String name, String provider) {
        String username = email; // hoặc email.split("@")[0]

        UserCreationRequest request = UserCreationRequest.builder()
                .username(username)
                .email(email)
                .password(UUID.randomUUID().toString()) // random password
                .firstName(extractFirstName(name))
                .lastName(extractLastName(name))
                .authProvider(provider)
                .roles(Set.of(UserRole.USER))
                .build();

        UserResponse response = userService.createUser(request);

        return userRepository.findByIdWithRoles(response.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private String extractFirstName(String fullName) {
        if (fullName == null) return "";
        return fullName.split(" ")[0];
    }

    private String extractLastName(String fullName) {
        if (fullName == null) return "";
        String[] parts = fullName.split(" ");
        return parts.length > 1 ? parts[parts.length - 1] : "";
    }


    private String getProvider(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.contains("google")) {
            return "google";
        } else if (uri.contains("facebook")) {
            return "facebook";
        }
        return "unknown";
    }
}