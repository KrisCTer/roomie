package com.roomie.services.booking_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    // PROPERTY
    PROPERTY_NOT_FOUND(1009, "Property not found", HttpStatus.NOT_FOUND),
    PROPERTY_LOCKED(1010, "Property is temporarily locked", HttpStatus.CONFLICT),
    PROPERTY_NOT_APPROVED(1011, "Property not approved", HttpStatus.BAD_REQUEST),
    PROPERTY_NOT_AVAILABLE(1012, "Property not available", HttpStatus.BAD_REQUEST),

    // LONG TERM
    LONG_TERM_NOT_AVAILABLE(1013, "Property not available for lease period", HttpStatus.CONFLICT),
    LONG_TERM_INVALID_STATUS(1014, "Invalid status transition for long-term lease", HttpStatus.CONFLICT),

    // GENERAL
    BOOKING_NOT_FOUND(1015, "Booking not found", HttpStatus.NOT_FOUND),
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