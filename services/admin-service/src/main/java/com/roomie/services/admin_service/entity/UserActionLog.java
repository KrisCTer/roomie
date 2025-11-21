package com.roomie.services.admin_service.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "user_activity_logs")
public class UserActionLog {
    @MongoId
    String id;
    String userId;
    String action;
    String service;
    String path;
    String method;
    Integer status;
    String ip;
    Instant timestamp;
    Map<String, Object> metadata;
}
