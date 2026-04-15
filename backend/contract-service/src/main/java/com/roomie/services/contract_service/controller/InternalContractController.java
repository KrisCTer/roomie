package com.roomie.services.contract_service.controller;

import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.ContractResponse;
import com.roomie.services.contract_service.mapper.ContractMapper;
import com.roomie.services.contract_service.repository.ContractRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalContractController {
    ContractRepository contractRepository;
    ContractMapper contractMapper;

    @GetMapping("/contracts")
    public ApiResponse<List<ContractResponse>> getAllContracts() {
        List<ContractResponse> contracts = contractRepository.findAll().stream()
                .map(contractMapper::toResponse)
                .toList();
        return ApiResponse.success(contracts, "Fetched all contracts");
    }

    @GetMapping("/contracts/{id}")
    public ApiResponse<ContractResponse> getContract(@PathVariable String id) {
        return contractRepository.findById(id)
                .map(c -> ApiResponse.success(contractMapper.toResponse(c), "Fetched contract"))
                .orElse(ApiResponse.success(null, "Contract not found"));
    }
}
