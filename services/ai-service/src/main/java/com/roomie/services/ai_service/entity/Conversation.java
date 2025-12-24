package com.roomie.services.ai_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {

    @Id
    String id;

    @Indexed
    String userId;

    String title; // Auto-generated from first message

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    Integer messageCount;

    Integer totalTokens;

    Boolean isActive;
}