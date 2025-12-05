package com.roomie.services.chat_service.controller;

import java.time.Instant;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.roomie.services.chat_service.dto.request.IntrospectRequest;
import com.roomie.services.chat_service.entity.WebSocketSession;
import com.roomie.services.chat_service.service.IdentityService;
import com.roomie.services.chat_service.service.WebSocketSessionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {
    SocketIOServer server;
    IdentityService identityService;
    WebSocketSessionService webSocketSessionService;

    @OnConnect
    public void clientConnected(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        var introspectResponse = identityService.introspect(
                IntrospectRequest.builder().token(token).build());
        if (introspectResponse.isValid()) {
            log.info("Client connected: {}", client.getSessionId());
            WebSocketSession session = new WebSocketSession()
                    .builder()
                    .socketSessionId(client.getSessionId().toString())
                    .userId(introspectResponse.getUserId())
                    .createdAt(Instant.now())
                    .build();
            webSocketSessionService.create(session);
            log.info("WebSocketSession created with contractId: {}", session.getId());
        } else {
            log.info("Authentication fail: {}", client.getSessionId());
            client.disconnect();
        }
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        log.info("Client disconnected: {}", client.getSessionId());
        webSocketSessionService.deleteSession(client.getSessionId().toString());
    }

    @PostConstruct
    public void startServer() {
        server.start();
        server.addListeners(this);
        log.info("Server started");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Server stopped");
    }
}
