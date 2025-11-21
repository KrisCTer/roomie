package com.roomie.services.admin_service.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LogsResponse {
    String id;
    String type;        // ERROR, AUDIT, ACTIVITY, API_USAGE, PERFORMANCE, ALERT
    String message;
    String source;      // module/service
    Instant timestamp;
    String userId;      // optional
    Map<String, Object> details;     // optional JSON string
}
