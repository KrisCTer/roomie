package com.roomie.services.admin_service.repository.httpclient;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.contract.ContractResponse;
import com.roomie.services.admin_service.configuration.FeignConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "contract-service",
        configuration = { FeignConfiguration.class })
public interface ContractClient {
    @GetMapping(value = "/internal/contracts", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<ContractResponse>> getAllContracts();

    @GetMapping(value = "/internal/contracts/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ContractResponse> getContract(@PathVariable("id") String id);
}
