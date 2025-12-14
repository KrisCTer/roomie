package com.roomie.services.booking_service.controller;

import com.roomie.services.booking_service.dto.request.BookingRequest;
import com.roomie.services.booking_service.dto.response.ApiResponse;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LeaseController {
    BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingRequest req) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.create(req),"Created booking successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> get(@PathVariable String id) {
        return bookingService.getById(id)
                .map(booking -> ResponseEntity.ok(
                        ApiResponse.success(booking, "Fetched booking successfully")))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Booking not found")));
    }
    @GetMapping("/tenant/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getTenantBookings() {
        String tenantId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<BookingResponse> bookings = bookingService.getBookingsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(
                bookings,
                "Fetched tenant bookings successfully"
        ));
    }
    @GetMapping("/landlord/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getOwnerBookings() {
        String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<BookingResponse> bookings = bookingService.getBookingsByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(
                bookings,
                "Fetched owner bookings successfully"
        ));
    }
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getPropertyBookings(
            @PathVariable String propertyId) {
        List<BookingResponse> bookings = bookingService.getBookingsByProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success(
                bookings,
                "Fetched property bookings successfully"
        ));
    }
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirm(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.confirm(id),"Confirmed booking successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancel(id),"Cancelled booking successfully"));
    }
    @PostMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<BookingResponse>> pause(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.pause(id, reason),
                "Paused booking successfully"
        ));
    }
    @PostMapping("/{id}/resume")
    public ResponseEntity<ApiResponse<BookingResponse>> resume(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.resume(id),
                "Resumed booking successfully"
        ));
    }
    @PostMapping("/{id}/terminate")
    public ResponseEntity<ApiResponse<BookingResponse>> terminate(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.terminate(id, reason),
                "Terminated booking successfully"
        ));
    }
    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<BookingResponse>> renew(
            @PathVariable String id,
            @Valid @RequestBody BookingRequest renewalRequest) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.renew(id, renewalRequest),
                "Renewed booking successfully"
        ));
    }
}
