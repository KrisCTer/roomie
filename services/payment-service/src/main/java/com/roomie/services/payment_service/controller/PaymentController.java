package com.roomie.services.payment_service.controller;

import com.roomie.services.payment_service.dto.request.PaymentRequest;
import com.roomie.services.payment_service.dto.response.ApiResponse;
import com.roomie.services.payment_service.dto.response.PaymentResponse;
import com.roomie.services.payment_service.service.PaymentService;
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
public class PaymentController {
    PaymentService paymentService;

    // Tạo payment → trả URL thanh toán
    @PostMapping
    public ApiResponse<String> createPayment(@RequestBody PaymentRequest req) {
        String response = paymentService.createPayment(req);
        return ApiResponse.success(response, "Payment created");
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable String id) {
        return ApiResponse.success(paymentService.getPayment(id),"Get payment by id successful");
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.success(paymentService.getAllPayments(), "Get all payment successful");
    }

    // VNPay callback
    @GetMapping("/webhook/vnpay")
    public ApiResponse<PaymentResponse> vnPayCallback(
            @RequestParam String transactionId,
            @RequestParam String status
    ) {
        return ApiResponse.success(paymentService.handleVnPayCallback(transactionId, status), "Payment callback successful");
    }

    // MoMo callback
    @PostMapping("/webhook/momo")
    public ApiResponse<PaymentResponse> momoCallback(
            @RequestParam String transactionId,
            @RequestParam String status
    ) {
        return ApiResponse.success(paymentService.handleMoMoCallback(transactionId, status), "Payment callback successful");
    }
}
