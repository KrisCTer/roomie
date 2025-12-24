package com.roomie.services.ai_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatRequest {

    String conversationId; // null = new conversation

    @NotBlank(message = "Message cannot be empty")
    String message;

    Boolean stream; // For streaming responses (future feature)

    String model; // Optional: override default model
}