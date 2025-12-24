package com.roomie.services.contract_service.exception;

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
    CONTRACT_NOT_FOUND(1009, "Contract not found", HttpStatus.NOT_FOUND),
    CONTRACT_EXISTS(1010, "Contract exists", HttpStatus.CONFLICT),
    RESOURCE_LOCKED(1011, "Resource locked", HttpStatus.SERVICE_UNAVAILABLE),
    ALREADY_SIGNED(1012, "Already Signed", HttpStatus.CONFLICT),
    FAILED_TO_GEN_PDF(1013,"Failed to generate PDF: ",HttpStatus.CONFLICT),
    CONTRACT_UPLOAD_FAILED(1014,"Contract PDF upload failed",HttpStatus.CONFLICT),
    CONTRACT_GENERATE_FAILED(1015,"Failed to generate and upload PDF",HttpStatus.CONFLICT),
    INVALID_CONTRACT_STATUS(1016,"Invalid contract status",HttpStatus.CONFLICT),
    INVALID_OTP(1017,"Invalid OTP",HttpStatus.BAD_REQUEST),
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