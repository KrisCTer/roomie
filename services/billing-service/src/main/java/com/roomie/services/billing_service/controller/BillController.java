package com.roomie.services.billing_service.controller;

import com.roomie.services.billing_service.dto.request.BillRequest;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.BillResponse;
import com.roomie.services.billing_service.service.BillingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BillController {
    BillingService service;

    @PostMapping
    public ResponseEntity<ApiResponse<BillResponse>> create(@Valid @RequestBody BillRequest req) {
        BillResponse response = service.createBill(req);
        return ResponseEntity.ok(ApiResponse.success(response, "Create billing successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getOne(@PathVariable String id) {
        BillResponse response = service.getBill(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Get billing detail successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponse>>> getAll() {
        List<BillResponse> list = service.getAll();
        return ResponseEntity.ok(ApiResponse.success(list, "Get all billing detail successfully"));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getByContract(@PathVariable String contractId) {
        List<BillResponse> list = service.getByContract(contractId);
        return ResponseEntity.ok(ApiResponse.success(list, "Get all billing detail successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> update(@PathVariable String id,@Valid @RequestBody BillRequest req) {
        BillResponse response = service.updateBill(id, req);
        return ResponseEntity.ok(ApiResponse.success(response, "Update billing detail successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.deleteBill(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Delete billing successfully"));
    }
    @PostMapping("/{billId}/send")
    public ApiResponse<BillResponse> sendBill(@PathVariable String billId) {
        BillResponse response = service.send(billId);
        return ApiResponse.success(response, "Bill sent successfully");
    }
    @PostMapping("/{billId}/pay")
    public ApiResponse<BillResponse> payBill(
            @PathVariable String billId,
            @RequestParam String paymentId
    ) {
        BillResponse response = service.pay(billId, paymentId);
        return ApiResponse.success(response, "Bill paid successfully");
    }

    @GetMapping("/landlord/my-bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getMyLandlordBills() {
        List<BillResponse> list = service.getMyLandlordBills();
        return ResponseEntity.ok(ApiResponse.success(list, "Get landlord bills successfully"));
    }

    @GetMapping("/tenant/my-bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getMyTenantBills() {
        List<BillResponse> list = service.getMyTenantBills();
        return ResponseEntity.ok(ApiResponse.success(list, "Get tenant bills successfully"));
    }
}
