package com.roomie.services.admin_service.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.roomie.services.admin_service.dto.response.LogsResponse;
import com.roomie.services.admin_service.service.LogStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LogSubscriber {

    private final LogStreamService streamService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public void onMessage(String message) {
        try {
            LogsResponse logDto = objectMapper.readValue(message, LogsResponse.class);
            streamService.forwardToClients(logDto);
        } catch (Exception e) {
            log.error("Failed to parse redis log message: {}", message, e);
        }
    }
}
