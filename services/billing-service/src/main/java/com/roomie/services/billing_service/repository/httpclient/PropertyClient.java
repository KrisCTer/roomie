package com.roomie.services.billing_service.repository.httpclient;

import com.roomie.services.billing_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.billing_service.configuration.FeignMultipartConfig;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.property.PropertyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-service", url = "${app.services.property}",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface PropertyClient {
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PropertyResponse> get(@PathVariable String id);
}
