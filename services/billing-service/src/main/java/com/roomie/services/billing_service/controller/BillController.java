package com.roomie.services.billing_service.controller;

import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.service.BillingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BillController {
    BillingService service;

    @PostMapping
    public ApiResponse<BillResponse> create(@RequestBody BillRequest req) {
        BillResponse response = service.createBill(req);
        return ApiResponse.success(response, "Create billing successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<BillResponse> getOne(@PathVariable String id) {
        BillResponse response = service.getBill(id);
        return ApiResponse.success(response, "Get billing detail successfully");
    }

    @GetMapping
    public ApiResponse<List<BillResponse>> getAll() {
        List<BillResponse> list = service.getAll();
        return ApiResponse.success(list, "Get all billing detail successfully");
    }

    @GetMapping("/contract/{contractId}")
    public ApiResponse<List<BillResponse>> getByContract(@PathVariable String contractId) {
        List<BillResponse> list = service.getByContract(contractId);
        return ApiResponse.success(list, "Get all billing detail successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<BillResponse> update(@PathVariable String id, @RequestBody BillRequest req) {
        BillResponse response = service.updateBill(id, req);
        return ApiResponse.success(response, "Update billing detail successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        service.deleteBill(id);
        return ApiResponse.success(null, "Delete billing successfully");
    }
}
