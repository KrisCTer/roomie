package com.roomie.services.payment_service.controller;

import com.roomie.services.payment_service.dto.request.MoMoWebhookRequest;
import com.roomie.services.payment_service.dto.request.PaymentRequest;
import com.roomie.services.payment_service.dto.response.ApiResponse;
import com.roomie.services.payment_service.dto.response.PaymentResponse;
import com.roomie.services.payment_service.entity.Payment;
import com.roomie.services.payment_service.repository.PaymentRepository;
import com.roomie.services.payment_service.service.MoMoService;
import com.roomie.services.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    PaymentRepository paymentRepository;

    // Tạo payment → trả URL thanh toán
    @PostMapping
    public ApiResponse<Payment> createPayment(@RequestBody PaymentRequest req) {
        Payment response = paymentService.createPayment(req);
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
    @GetMapping("/momo/return")
    public void momoReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response
    ) throws IOException {

        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        Payment payment = paymentRepository.findById(orderId).orElseThrow();
        String billId = payment.getBillId();

        if ("0".equals(resultCode)) {
            response.sendRedirect(
                    "http://localhost:3000/bill-detail/" + billId + "?payment=success"
            );
        } else {
            response.sendRedirect(
                    "http://localhost:3000/bill-detail/" + orderId + "?payment=failed"
            );
        }
    }


    @PostMapping("/webhook/momo")
    public ResponseEntity<?> momoWebhook(
            @RequestBody Map<String, Object> body
    ) {
        String orderId = (String) body.get("orderId");
        Integer resultCode = (Integer) body.get("resultCode");
        String transId = String.valueOf(body.get("transId"));

        Payment payment = paymentRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (resultCode == 0) {
            payment.setStatus("COMPLETED");
            payment.setTransactionId(transId);
        } else {
            payment.setStatus("FAILED");
        }

        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        return ResponseEntity.ok().build();
    }
}
