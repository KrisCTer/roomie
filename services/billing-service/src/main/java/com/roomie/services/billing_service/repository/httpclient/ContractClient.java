package com.roomie.services.billing_service.repository.httpclient;

import com.roomie.services.billing_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.billing_service.configuration.FeignMultipartConfig;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.ContractResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "contract-service", url = "${app.services.contract}",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface ContractClient {
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<ApiResponse<ContractResponse>> get(@PathVariable String id);
    @GetMapping("/my-contracts")
    ApiResponse<Map<String, List<ContractResponse>>> getMyContracts();
}