package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.booking.BookingResponse;
import com.roomie.services.admin_service.repository.httpclient.BookingClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingAdminController {
    BookingClient bookingClient;

    @GetMapping
    public ApiResponse<List<BookingResponse>> getAllBookings() {
        var result = bookingClient.getAllBookings();
        return ApiResponse.success(result.getResult(), "Fetched all bookings");
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> getBooking(@PathVariable String id) {
        var result = bookingClient.getBooking(id);
        return ApiResponse.success(result.getResult(), "Fetched booking detail");
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> forceCancel(@PathVariable String id) {
        var result = bookingClient.forceCancel(id);
        return ApiResponse.success(result.getResult(), "Booking force cancelled");
    }
}
