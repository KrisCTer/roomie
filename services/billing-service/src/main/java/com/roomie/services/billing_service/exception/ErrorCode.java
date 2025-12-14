package com.roomie.services.billing_service.exception;

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
    CONTRACT_NOT_FOUND(1011,"ContractId không tồn tại",HttpStatus.NOT_FOUND),
    CONTRACT_SERVICE_ERROR(1012,"Lỗi khi kiểm tra contract", HttpStatus.INTERNAL_SERVER_ERROR),
    BILLING_MONTH_REQUIRED(1013,"billingMonth is required (format YYYY-MM)", HttpStatus.BAD_REQUEST),
    BILLING_MONTH_INVALID(1014,"Invalid billingMonth format. Expected YYYY-MM", HttpStatus.BAD_REQUEST),
    BILL_ALREADY_EXISTS(1015,"Bill for this month already exists", HttpStatus.CONFLICT),
    FIRST_BILL_MISSING_OLD_VALUES(1016,"Không có bill tháng trước. Bạn phải nhập electricityOld và waterOld.", HttpStatus.BAD_REQUEST),
    BILL_NOT_FOUND(1017,"Bill not found", HttpStatus.NOT_FOUND),
    INVALID_BILL_STATUS(1018,"Invalid bill status", HttpStatus.BAD_REQUEST),
    INVALID_METER_READING(1019,"Invalid meter reading", HttpStatus.BAD_REQUEST),
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