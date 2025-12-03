package com.roomie.services.contract_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    @Builder.Default
    private int code = 1000;

    boolean success;
    private String message;
    private T result;

    public static <T> ApiResponse<T> success(T result, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .result(result)
                .message(message)
                .build();
    }
    public static <T> ApiResponse<T> error(String message, int code) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .build();
    }
}