package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.configuration.KafkaConfig;
import com.roomie.services.admin_service.dto.response.LogsPageResponse;
import com.roomie.services.admin_service.dto.response.LogsResponse;
import com.roomie.services.admin_service.entity.UserActionLog;
import com.roomie.services.admin_service.service.LogAdminService;
import com.roomie.services.admin_service.service.LogStreamService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LogAdminController {
    LogAdminService logAdminService;
    LogStreamService logStreamService;
    KafkaTemplate<String, Object> kafkaTemplate;

    @GetMapping
    public LogsPageResponse getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String userId
    ) {
        Instant f = from != null ? from : Instant.now().minusSeconds(86400);
        Instant t = to != null ? to : Instant.now();
        return logAdminService.getAllLogs(page, size, f, t, type, userId);
    }
    @GetMapping(path = "/stream/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogsSse() {
        SseEmitter emitter = logStreamService.registerSse();
        try { emitter.send(SseEmitter.event().name("init").data("{\"message\":\"connected\"}")); }
        catch (Exception ignored) {}
        return emitter;
    }
}
