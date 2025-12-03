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
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirm(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.confirm(id),"Confirmed booking successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancel(id),"Cancelled booking successfully"));
    }
}
