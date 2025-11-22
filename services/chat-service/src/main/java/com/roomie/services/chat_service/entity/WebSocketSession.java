package com.roomie.services.chat_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_message")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebSocketSession {
    @MongoId
    String id;

    String socketSessionId;

    String userId;

    Instant createdAt;
}
