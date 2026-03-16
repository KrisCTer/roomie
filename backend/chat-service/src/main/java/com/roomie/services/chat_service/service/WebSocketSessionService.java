package com.roomie.services.chat_service.service;

import org.springframework.stereotype.Service;

import com.roomie.services.chat_service.entity.WebSocketSession;
import com.roomie.services.chat_service.repository.WebSocketSessionRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebSocketSessionService {
    WebSocketSessionRepository webSocketSessionRepository;

    public WebSocketSession create(WebSocketSession webSocketSession) {
        return webSocketSessionRepository.save(webSocketSession);
    }

    public void deleteSession(String sessionId) {
        webSocketSessionRepository.deleteBySocketSessionId(sessionId);
    }

    /**
     * Find WebSocket session by userId
     * Used for call signaling to find target user's socket connection
     */
    public WebSocketSession findByUserId(String userId) {
        return webSocketSessionRepository.findByUserId(userId).orElse(null);
    }
}
