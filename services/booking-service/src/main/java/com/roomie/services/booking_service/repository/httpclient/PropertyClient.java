package com.roomie.services.booking_service.repository.httpclient;

import com.roomie.services.booking_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.booking_service.configuration.FeignMultipartConfig;
import com.roomie.services.booking_service.dto.response.ApiResponse;
import com.roomie.services.booking_service.dto.response.property.PropertyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@FeignClient(name = "property-service", url = "${app.services.properties}",
        configuration = { FeignMultipartConfig.class, AuthenticationRequestInterceptor.class })
public interface PropertyClient {
    @GetMapping(value="/internal/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PropertyResponse> getById(@PathVariable String id);

    @PostMapping(value="/{propertyId}/rented", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> markAsRented(@PathVariable String propertyId);

    @PostMapping(value="/{propertyId}/available", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> markAsAvailable(@PathVariable String propertyId);

    @PostMapping(value="/{propertyId}/deactivate", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<String> deactivate(@PathVariable String propertyId);

    @GetMapping(value = "/internal/owner/{ownerId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<PropertyResponse>> getPropertiesByOwner(@PathVariable String ownerId);

}