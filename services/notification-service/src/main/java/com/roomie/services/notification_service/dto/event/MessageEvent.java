package com.roomie.services.notification_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageEvent {
    String messageId;
    String conversationId;
    String senderId;
    String senderName;
    String receiverId;
    String content;
    String messageType;  // TEXT, IMAGE, FILE
    Instant sentAt;
}