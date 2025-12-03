package com.roomie.services.admin_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.roomie.services.admin_service.dto.response.LogsResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LogStreamService {
    public static final String CHANNEL = "admin-logs-stream";

    Set<SseEmitter> sseEmitters = ConcurrentHashMap.newKeySet();
    Set<WebSocketSession> wsSessions = new CopyOnWriteArraySet<>();

    ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    StringRedisTemplate redisTemplate;


    public SseEmitter registerSse() {
        SseEmitter emitter = new SseEmitter(0L);

        sseEmitters.add(emitter);

        emitter.onCompletion(() -> sseEmitters.remove(emitter));
        emitter.onTimeout(() -> sseEmitters.remove(emitter));
        emitter.onError((err) -> sseEmitters.remove(emitter));

        return emitter;
    }

    public void registerWs(WebSocketSession session) {
        wsSessions.add(session);
    }

    public void unregisterWs(WebSocketSession session) {
        wsSessions.remove(session);
    }

    public void publish(LogsResponse log) {
        try {
            String payload = objectMapper.writeValueAsString(log);
            redisTemplate.convertAndSend(CHANNEL, payload);
        } catch (Exception e) {
//            log.error("Failed to publish log to Redis", e);
        }
    }

    public void forwardToClients(LogsResponse log) {
        String payload;

        try {
            payload = objectMapper.writeValueAsString(log);
        } catch (Exception ex) {
            ex.printStackTrace();
            payload = "{\"type\":\"ERROR\",\"message\":\"serialization_error\"}";
        }

        // ==========================================
        // Handle SSE
        // ==========================================
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : sseEmitters) {
            try {
                emitter.send(SseEmitter.event().name("log").data(payload));
            } catch (IOException ioe) {
                deadEmitters.add(emitter);
            }
        }

        // Remove dead emitters
        sseEmitters.removeAll(deadEmitters);


        // ==========================================
        // Handle WebSocket
        // ==========================================
        List<WebSocketSession> closedSessions = new ArrayList<>();

        for (WebSocketSession session : wsSessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(payload));
                } else {
                    closedSessions.add(session);
                }
            } catch (Exception ex) {
                closedSessions.add(session);
            }
        }

        closedSessions.forEach(session -> {
            try { session.close(); } catch (Exception ignored) {}
            wsSessions.remove(session);
        });
    }
}
