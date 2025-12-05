package com.roomie.services.chat_service.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.roomie.services.chat_service.entity.WebSocketSession;

@Repository
public interface WebSocketSessionRepository extends MongoRepository<WebSocketSession, String> {
    void deleteBySocketSessionId(String socketSessionId);

    /**
     * Find WebSocket session by userId
     * Used for call signaling and targeted message delivery
     */
    Optional<WebSocketSession> findByUserId(String userId);
}