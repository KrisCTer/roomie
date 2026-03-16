package com.roomie.services.profile_service.exception;

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
    PROFILE_ALREADY_EXISTS(1009, "Profile already exists", HttpStatus.CONFLICT),
    PROFILE_NOT_FOUND(1010, "Profile not found", HttpStatus.NOT_FOUND),
    QR_NOT_FOUND_IN_IMAGE(1011,"QR code not found in image", HttpStatus.NOT_FOUND),
    INVALID_IDCARD(1012,"Invalid Vietnam IDCard QR format", HttpStatus.BAD_REQUEST),
    QR_EXTRACTION_FAILED(1013,"Failed to extract QR code info: ", HttpStatus.BAD_REQUEST),
    USER_ID_REQUIRED(1014,"User id required", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(1015,"File upload failed", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1016,"User not found", HttpStatus.NOT_FOUND),
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