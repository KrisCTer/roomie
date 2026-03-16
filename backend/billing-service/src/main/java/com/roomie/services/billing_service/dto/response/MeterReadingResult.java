package com.roomie.services.billing_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterReadingResult {
    boolean success;
    Double value;
    double confidence;
    String rawText;
    String extractedNumber;
    String error;

    public static MeterReadingResult error(String message) {
        return MeterReadingResult.builder()
                .success(false)
                .confidence(0.0)
                .error(message)
                .build();
    }
}
