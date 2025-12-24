package com.roomie.services.notification_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    NOTIFICATION_NOT_FOUND(2001, "Notification not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_ALREADY_READ(2002, "Notification already read", HttpStatus.BAD_REQUEST),
    INVALID_NOTIFICATION_TYPE(2003, "Invalid notification type", HttpStatus.BAD_REQUEST),
    TEMPLATE_NOT_FOUND(2004, "Notification template not found", HttpStatus.NOT_FOUND),
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