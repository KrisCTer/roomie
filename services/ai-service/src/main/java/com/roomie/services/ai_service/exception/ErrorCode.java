package com.roomie.services.ai_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),

    // AI Service specific errors
    AI_SERVICE_ERROR(5001, "AI service error", HttpStatus.INTERNAL_SERVER_ERROR),
    CONVERSATION_NOT_FOUND(5002, "Conversation not found", HttpStatus.NOT_FOUND),
    INVALID_MESSAGE(5003, "Invalid message", HttpStatus.BAD_REQUEST),
    RATE_LIMIT_EXCEEDED(5004, "Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS),
    TOKEN_LIMIT_EXCEEDED(5005, "Token limit exceeded", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}