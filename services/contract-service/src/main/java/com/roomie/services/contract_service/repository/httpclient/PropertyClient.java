package com.roomie.services.contract_service.repository.httpclient;

import com.roomie.services.contract_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.contract_service.configuration.FeignMultipartConfig;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.property.PropertyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "property-service", url = "${app.services.properties}",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface PropertyClient {
    @GetMapping(value = "/internal/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PropertyResponse> getProperty(@PathVariable("id") String id);
}
