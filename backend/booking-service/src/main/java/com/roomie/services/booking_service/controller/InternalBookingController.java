package com.roomie.services.booking_service.controller;

import com.roomie.services.booking_service.dto.response.ApiResponse;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalBookingController {
    BookingService bookingService;

    @GetMapping("/bookings")
    public ApiResponse<List<BookingResponse>> getAllBookings() {
        return ApiResponse.success(bookingService.getAll(), "Fetched all bookings");
    }

    @GetMapping("/bookings/{id}")
    public ApiResponse<BookingResponse> getBooking(@PathVariable String id) {
        return ApiResponse.success(
                bookingService.getById(id).orElse(null),
                "Fetched booking"
        );
    }

    @PostMapping("/bookings/{id}/cancel")
    public ApiResponse<BookingResponse> forceCancel(@PathVariable String id) {
        return ApiResponse.success(bookingService.cancel(id), "Booking force cancelled");
    }
}
