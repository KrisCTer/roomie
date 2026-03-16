package com.roomie.services.admin_service.configuration;

import com.roomie.services.admin_service.service.LogStreamService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminLogWebSocketHandler extends TextWebSocketHandler {
    LogStreamService logStreamService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logStreamService.registerWs(session);
        session.sendMessage(new TextMessage("{\"message\":\"connected\"}"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logStreamService.unregisterWs(session);
    }
}
