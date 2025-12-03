package com.roomie.services.admin_service.configuration;

import com.roomie.services.admin_service.dto.response.LogsResponse;
import com.roomie.services.admin_service.entity.UserActionLog;
import com.roomie.services.admin_service.repository.UserActivityLogRepository;
import com.roomie.services.admin_service.service.LogStreamService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserActivityConsumer {
    @Autowired
    UserActivityLogRepository repo;

    @Autowired
    LogStreamService logStreamService;

    @KafkaListener(
            topics = KafkaConfig.USER_ACTIVITY_EVENTS,
            groupId = "log-consumers",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(UserActionLog e) {
        UserActionLog saved = repo.save(e);
        LogsResponse log = LogsResponse.builder()
                .id(saved.getId())
                .type("USER_ACTIVITY")
                .message(saved.getAction())
                .source("mongodb")
                .timestamp(saved.getTimestamp())
                .userId(saved.getUserId())
                .details(Map.of("path", saved.getPath(), "method", saved.getMethod()))
                .build();

        // Gửi realtime
        logStreamService.publish(log);
    }
}
