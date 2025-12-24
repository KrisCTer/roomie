package com.roomie.services.notification_service.controller;

import com.roomie.services.notification_service.service.WebSocketNotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WebSocketController {

    WebSocketNotificationService webSocketService;

    /**
     * Handle WebSocket subscription
     */
    @MessageMapping("/notifications/subscribe")
    @SendTo("/topic/notifications")
    public String handleSubscribe(@Payload String message, SimpMessageHeaderAccessor headerAccessor) {
        Principal user = headerAccessor.getUser();
        if (user != null) {
            log.info("User {} subscribed to notifications", user.getName());
            return "Subscribed successfully";
        }
        return "Subscription failed";
    }

    /**
     * Handle ping/pong for connection keep-alive
     */
    @MessageMapping("/notifications/ping")
    @SendTo("/topic/notifications/pong")
    public String handlePing() {
        return "pong";
    }
}