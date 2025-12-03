package com.roomie.services.payment_service.controller;

import com.roomie.services.payment_service.dto.request.PaymentRequest;
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
    public String createPayment(@RequestBody PaymentRequest req) {
        return paymentService.createPayment(req);
    }

    @GetMapping("/{id}")
    public PaymentResponse getPayment(@PathVariable String id) {
        return paymentService.getPayment(id);
    }

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // VNPay callback (GET)
    @GetMapping("/webhook/vnpay")
    public PaymentResponse vnPayCallback(@RequestParam String transactionId,
                                         @RequestParam String status) {
        return paymentService.handleVnPayCallback(transactionId, status);
    }

    // MoMo callback (POST)
    @PostMapping("/webhook/momo")
    public PaymentResponse momoCallback(@RequestParam String transactionId,
                                        @RequestParam String status) {
        return paymentService.handleMoMoCallback(transactionId, status);
    }
}
