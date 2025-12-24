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
public class ConversationResponse {

    String id;

    String userId;

    String title;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    Integer messageCount;

    Integer totalTokens;

    String lastMessage; // Preview of last message
}