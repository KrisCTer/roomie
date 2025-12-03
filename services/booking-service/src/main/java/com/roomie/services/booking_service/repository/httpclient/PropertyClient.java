package com.roomie.services.booking_service.repository.httpclient;

import com.roomie.services.booking_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.booking_service.dto.response.ApiResponse;
import com.roomie.services.booking_service.dto.response.property.PropertyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-service", url = "${app.services.properties}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface PropertyClient {
    @GetMapping("/internal/{id}")
    ApiResponse<PropertyResponse> getById(@PathVariable String id);
}

