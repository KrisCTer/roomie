package com.roomie.services.ai_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatResponse {

    String conversationId;

    String messageId;

    String content;

    String role;

    LocalDateTime timestamp;

    Integer tokenCount;

    String model;
}