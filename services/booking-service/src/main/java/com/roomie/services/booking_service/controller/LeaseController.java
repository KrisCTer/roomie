package com.roomie.services.booking_service.controller;

import com.roomie.services.booking_service.dto.request.BookingRequest;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest req) {
        return ResponseEntity.ok(bookingService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> get(@PathVariable String id) {
        return bookingService.getById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirm(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.confirm(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }
}
