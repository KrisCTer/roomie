package com.roomie.services.contract_service.repository.httpclient;

import com.roomie.services.contract_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.contract_service.configuration.FeignMultipartConfig;
import com.roomie.services.contract_service.dto.request.BillRequest;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.BillResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "billing-service",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class})
public interface  BillingClient {
    @PostMapping(value="/internal/bills", produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<ApiResponse<BillResponse>> createBill(@RequestBody BillRequest request);

    /**
     * Đánh dấu bill đã thanh toán
     */
//    @PostMapping("/{billId}/pay")
//    ResponseEntity<ApiResponse<BillResponse>> payBill(
//            @PathVariable String billId,
//            @RequestParam String paymentId
//    );

    /**
     * Lấy thông tin bill theo contract
     */
//    @GetMapping("/contract/{contractId}")
//    ResponseEntity<ApiResponse<BillResponse>> getBillsByContract(
//            @PathVariable String contractId
//    );
}
