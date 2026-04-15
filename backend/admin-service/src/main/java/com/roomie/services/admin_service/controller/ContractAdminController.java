package com.roomie.services.admin_service.controller;

import com.roomie.services.admin_service.dto.response.ApiResponse;
import com.roomie.services.admin_service.dto.response.contract.ContractResponse;
import com.roomie.services.admin_service.repository.httpclient.ContractClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractAdminController {
    ContractClient contractClient;

    @GetMapping
    public ApiResponse<List<ContractResponse>> getAllContracts() {
        var result = contractClient.getAllContracts();
        return ApiResponse.success(result.getResult(), "Fetched all contracts");
    }

    @GetMapping("/{id}")
    public ApiResponse<ContractResponse> getContract(@PathVariable String id) {
        var result = contractClient.getContract(id);
        return ApiResponse.success(result.getResult(), "Fetched contract detail");
    }
}
