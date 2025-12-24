package com.roomie.services.ai_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {

    @Id
    String id;

    String conversationId;

    String role; // "user" or "assistant"

    String content;

    LocalDateTime createdAt;

    // Metadata
    Integer tokenCount;

    String model;
}