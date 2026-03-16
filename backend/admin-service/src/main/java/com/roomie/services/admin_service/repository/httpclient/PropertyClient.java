package com.roomie.services.admin_service.repository.httpclient;

import com.roomie.services.admin_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.property.PropertyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "property-service", url = "${app.services.properties}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface PropertyClient {
    @GetMapping("internal/pending")
    ApiResponse<List<PropertyResponse>> getPendingProperties();

    @PutMapping("/internal/{id}/approve")
    ApiResponse<Void> approveProperty(@PathVariable("id") String id);

    @PutMapping("/internal/{id}/reject")
    ApiResponse<Void> rejectProperty(@PathVariable("id") String id);

    @GetMapping("/internal/{id}")
    ApiResponse<PropertyResponse> getProperty(@PathVariable("id") String id);

    @PutMapping("/internal/{id}")
    ApiResponse<Void> updateProperty(@PathVariable("id") String id, @RequestBody PropertyResponse dto);
}
