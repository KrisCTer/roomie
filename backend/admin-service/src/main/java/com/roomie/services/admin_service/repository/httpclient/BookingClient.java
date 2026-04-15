package com.roomie.services.admin_service.repository.httpclient;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.booking.BookingResponse;
import com.roomie.services.admin_service.configuration.FeignConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@FeignClient(name = "booking-service",
        configuration = { FeignConfiguration.class })
public interface BookingClient {
    @GetMapping(value = "/internal/bookings", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<BookingResponse>> getAllBookings();

    @GetMapping(value = "/internal/bookings/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<BookingResponse> getBooking(@PathVariable("id") String id);

    @PostMapping(value = "/internal/bookings/{id}/cancel", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<BookingResponse> forceCancel(@PathVariable("id") String id);
}
