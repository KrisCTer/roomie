package com.roomie.services.property_service.repository.httpclient;

import com.roomie.services.property_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.property_service.dto.request.PropertyReviewRequest;
import com.roomie.services.property_service.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "admin-service", url = "${app.services.admin}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface AdminClient {
    @PostMapping(value = "/reviews", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> addPropertyToReviewQueue(@RequestBody PropertyReviewRequest request);

    @PostMapping(value = "/reviews/{id}/approve", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> approveProperty(@PathVariable("id") String propertyId);
}
