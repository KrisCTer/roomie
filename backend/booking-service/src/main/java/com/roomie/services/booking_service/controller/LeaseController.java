package com.roomie.services.booking_service.controller;

import com.roomie.services.booking_service.dto.request.BookingRequest;
import com.roomie.services.booking_service.dto.response.ApiResponse;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.exception.AppException;
import com.roomie.services.booking_service.exception.ErrorCode;
import com.roomie.services.booking_service.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LeaseController {
    BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> create(@Valid @RequestBody BookingRequest req) {
        return ApiResponse.success(bookingService.create(req), "Created booking successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> get(@PathVariable String id) {
        BookingResponse booking = bookingService.getById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        return ApiResponse.success(booking, "Fetched booking successfully");
    }

    @GetMapping("/tenant/bookings")
    public ApiResponse<List<BookingResponse>> getTenantBookings() {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getBookingsByTenant(tenantId), "Fetched tenant bookings successfully");
    }

    @GetMapping("/landlord/bookings")
    public ApiResponse<List<BookingResponse>> getOwnerBookings() {
        String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.success(bookingService.getBookingsByOwner(ownerId), "Fetched owner bookings successfully");
    }

    @GetMapping("/property/{propertyId}")
    public ApiResponse<List<BookingResponse>> getPropertyBookings(@PathVariable String propertyId) {
        return ApiResponse.success(bookingService.getBookingsByProperty(propertyId), "Fetched property bookings successfully");
    }

    @PostMapping("/{id}/confirm")
    public ApiResponse<BookingResponse> confirm(@PathVariable String id) {
        return ApiResponse.success(bookingService.confirm(id), "Confirmed booking successfully");
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancel(@PathVariable String id) {
        return ApiResponse.success(bookingService.cancel(id), "Cancelled booking successfully");
    }

    @PostMapping("/{id}/pause")
    public ApiResponse<BookingResponse> pause(@PathVariable String id, @RequestParam(required = false) String reason) {
        return ApiResponse.success(bookingService.pause(id, reason), "Paused booking successfully");
    }

    @PostMapping("/{id}/resume")
    public ApiResponse<BookingResponse> resume(@PathVariable String id) {
        return ApiResponse.success(bookingService.resume(id), "Resumed booking successfully");
    }

    @PostMapping("/{id}/terminate")
    public ApiResponse<BookingResponse> terminate(@PathVariable String id, @RequestParam(required = false) String reason) {
        return ApiResponse.success(bookingService.terminate(id, reason), "Terminated booking successfully");
    }

    @PostMapping("/{id}/renew")
    public ApiResponse<BookingResponse> renew(@PathVariable String id, @Valid @RequestBody BookingRequest renewalRequest) {
        return ApiResponse.success(bookingService.renew(id, renewalRequest), "Renewed booking successfully");
    }
}
