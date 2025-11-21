package com.roomie.services.admin_service.configuration;

import com.roomie.services.admin_service.entity.UserActionLog;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ActivityLogInterceptor implements HandlerInterceptor {
    @Autowired
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        try {
            String userId = extractUserId(request);
            UserActionLog log = UserActionLog.builder()
                    .userId(userId)
                    .action(request.getMethod() + " " + request.getRequestURI())
                    .service("admin-service")
                    .path(request.getRequestURI())
                    .method(request.getMethod())
                    .status(response.getStatus())
                    .ip(request.getRemoteAddr())
                    .timestamp(Instant.now())
                    .metadata(Map.of())
                    .build();

            kafkaTemplate.send(KafkaConfig.USER_ACTIVITY_EVENTS, log);
        } catch (Exception ignored) {}
    }

    private String extractUserId(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }

        return "anonymous";
    }
}
