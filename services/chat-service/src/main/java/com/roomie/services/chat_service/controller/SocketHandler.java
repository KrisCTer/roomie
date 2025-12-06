package com.roomie.services.chat_service.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.listener.DataListener;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    ObjectMapper objectMapper = new ObjectMapper();
    static Map<String, String> users = new HashMap<>();
    static Map<String, String> rooms = new HashMap<>();

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
            log.info("WebSocketSession created with userId: {}", session.getUserId());
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

        // ========== CALL SIGNALING EVENTS ==========
        // ⭐ CRITICAL: Use Object.class to handle socket.io's flexible format

        // Initiate call
        server.addEventListener("call-user", Object.class, new DataListener<Object>() {
            @Override
            public void onData(
                    SocketIOClient client, Object rawData, com.corundumstudio.socketio.AckRequest ackRequest) {
                try {
                    // Parse data (might be List or Map depending on socket.io version)
                    Map<String, Object> data = parseSocketData(rawData);

                    String toUserId = (String) data.get("to");
                    log.info("📞 Call request from {} to {}", data.get("from"), toUserId);

                    // Find target user's socket session
                    var targetSession = webSocketSessionService.findByUserId(toUserId);
                    if (targetSession != null) {
                        // Find target client
                        for (SocketIOClient targetClient : server.getAllClients()) {
                            if (targetClient.getSessionId().toString().equals(targetSession.getSocketSessionId())) {
                                targetClient.sendEvent("incoming-call", data);
                                log.info("✅ Call request sent to user {}", toUserId);

                                // Send acknowledgment to caller
                                if (ackRequest.isAckRequested()) {
                                    ackRequest.sendAckData(Map.of("status", "sent"));
                                }
                                break;
                            }
                        }
                    } else {
                        log.warn("⚠️ User {} not connected", toUserId);
                        client.sendEvent("call-failed", Map.of("reason", "User not available"));

                        if (ackRequest.isAckRequested()) {
                            ackRequest.sendAckData(Map.of("status", "failed", "reason", "User not available"));
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ Error processing call-user event", e);
                    client.sendEvent("call-failed", Map.of("reason", "Internal error"));
                }
            }
        });

        // Answer call
        server.addEventListener("answer-call", Object.class, new DataListener<Object>() {
            @Override
            public void onData(
                    SocketIOClient client, Object rawData, com.corundumstudio.socketio.AckRequest ackRequest) {
                try {
                    Map<String, Object> data = parseSocketData(rawData);
                    String toUserId = (String) data.get("to");
                    log.info("✅ Call answered, sending to {}", toUserId);

                    var targetSession = webSocketSessionService.findByUserId(toUserId);
                    if (targetSession != null) {
                        for (SocketIOClient targetClient : server.getAllClients()) {
                            if (targetClient.getSessionId().toString().equals(targetSession.getSocketSessionId())) {
                                targetClient.sendEvent("webrtc-answer", data);
                                log.info("✅ Answer sent to user {}", toUserId);
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ Error processing answer-call event", e);
                }
            }
        });

        // Reject call
        server.addEventListener("reject-call", Object.class, new DataListener<Object>() {
            @Override
            public void onData(
                    SocketIOClient client, Object rawData, com.corundumstudio.socketio.AckRequest ackRequest) {
                try {
                    Map<String, Object> data = parseSocketData(rawData);
                    String toUserId = (String) data.get("to");
                    log.info("❌ Call rejected, notifying {}", toUserId);

                    var targetSession = webSocketSessionService.findByUserId(toUserId);
                    if (targetSession != null) {
                        for (SocketIOClient targetClient : server.getAllClients()) {
                            if (targetClient.getSessionId().toString().equals(targetSession.getSocketSessionId())) {
                                targetClient.sendEvent("call-rejected", data);
                                log.info("✅ Rejection sent to user {}", toUserId);
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ Error processing reject-call event", e);
                }
            }
        });

        // End call
        server.addEventListener("end-call", Object.class, new DataListener<Object>() {
            @Override
            public void onData(
                    SocketIOClient client, Object rawData, com.corundumstudio.socketio.AckRequest ackRequest) {
                try {
                    Map<String, Object> data = parseSocketData(rawData);
                    String toUserId = (String) data.get("to");
                    log.info("📴 Call ended, notifying {}", toUserId);

                    var targetSession = webSocketSessionService.findByUserId(toUserId);
                    if (targetSession != null) {
                        for (SocketIOClient targetClient : server.getAllClients()) {
                            if (targetClient.getSessionId().toString().equals(targetSession.getSocketSessionId())) {
                                targetClient.sendEvent("call-ended", data);
                                log.info("✅ Call end notification sent to user {}", toUserId);
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ Error processing end-call event", e);
                }
            }
        });

        // ICE candidate exchange
        server.addEventListener("ice-candidate", Object.class, new DataListener<Object>() {
            @Override
            public void onData(
                    SocketIOClient client, Object rawData, com.corundumstudio.socketio.AckRequest ackRequest) {
                try {
                    Map<String, Object> data = parseSocketData(rawData);
                    String toUserId = (String) data.get("to");

                    var targetSession = webSocketSessionService.findByUserId(toUserId);
                    if (targetSession != null) {
                        for (SocketIOClient targetClient : server.getAllClients()) {
                            if (targetClient.getSessionId().toString().equals(targetSession.getSocketSessionId())) {
                                targetClient.sendEvent("ice-candidate", data);
                                log.debug("📡 ICE candidate forwarded to {}", toUserId);
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ Error processing ice-candidate event", e);
                }
            }
        });

        log.info("✅ Server started with call signaling support");
    }

    /**
     * Parse socket.io data which might come as List or Map
     * Socket.io client sometimes wraps data in an array
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseSocketData(Object rawData) {
        if (rawData instanceof Map) {
            return (Map<String, Object>) rawData;
        } else if (rawData instanceof List) {
            List<?> list = (List<?>) rawData;
            if (!list.isEmpty() && list.get(0) instanceof Map) {
                return (Map<String, Object>) list.get(0);
            }
        }

        // Try to convert via Jackson
        try {
            String json = objectMapper.writeValueAsString(rawData);
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.error("❌ Failed to parse socket data: {}", rawData, e);
            return Map.of();
        }
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Server stopped");
    }
}
