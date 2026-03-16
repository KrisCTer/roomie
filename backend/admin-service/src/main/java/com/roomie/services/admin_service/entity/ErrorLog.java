package com.roomie.services.admin_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "error_logs")
public class ErrorLog {
    @MongoId
    String id;
    String service;
    String message;
    String type; // ERROR, API_USAGE, PERFORMANCE
    Instant timestamp;
    String details;
}
