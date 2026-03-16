package com.roomie.services.payment_service.repository.httpclient;

import com.roomie.services.payment_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.payment_service.configuration.FeignMultipartConfig;
import com.roomie.services.payment_service.dto.response.ApiResponse;
import com.roomie.services.payment_service.dto.response.ContractResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "contract-service",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface ContractClient {
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<ApiResponse<ContractResponse>> get(@PathVariable String id);

    @GetMapping(value = "/my-contracts", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Map<String, List<ContractResponse>>> getMyContracts();

    @PutMapping(
            value = "/{id}/payment-completed",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    ApiResponse<ContractResponse> onPaymentCompleted(
            @PathVariable("id") String id
    );
}