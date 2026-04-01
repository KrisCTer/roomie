package com.roomie.services.payment_service.controller;

import com.roomie.services.payment_service.dto.request.PaymentRequest;
import com.roomie.services.payment_service.dto.response.ApiResponse;
import com.roomie.services.payment_service.dto.response.PaymentResponse;
import com.roomie.services.payment_service.entity.Payment;
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
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    MoMoService moMoService;

    @PostMapping
    public ApiResponse<Payment> createPayment(@RequestBody PaymentRequest req) {
        Payment response = paymentService.createPayment(req);
        return ApiResponse.success(response, "Payment created");
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable String id) {
        return ApiResponse.success(paymentService.getPayment(id), "Get payment by id successful");
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.success(paymentService.getAllPayments(), "Get all payment successful");
    }

    // VNPay callback
    @GetMapping("/webhook/vnpay")
    public void vnPayCallback(
            @RequestParam String transactionId,
            @RequestParam String status,
            HttpServletResponse response) throws IOException {
        log.info("VNPay callback received - transactionId: {}, status: {}", transactionId, status);

        PaymentResponse payment = paymentService.handleVnPayCallback(transactionId, status);

        // Redirect based on status
        String billId = payment.getBillId();
        String contractId = payment.getContractId();
        String bookingId = payment.getBookingId();

        String redirectUrl = "http://localhost:3000";

        if (billId != null) {
            redirectUrl += "/bill-detail/" + billId;
        } else if (contractId != null) {
            redirectUrl += "/contracts/" + contractId;
        } else if (bookingId != null) {
            redirectUrl += "/bookings/" + bookingId;
        }

        redirectUrl += "?payment=" + ("COMPLETED".equals(status) ? "success" : "failed");

        response.sendRedirect(redirectUrl);
    }

    // MoMo return URL (redirect user)
    // @GetMapping("/momo/return")
    // public void momoReturn(
    // @RequestParam Map<String, String> params,
    // HttpServletResponse response
    // ) throws IOException {
    // log.info("MoMo return received - params: {}", params);
    //
    // String orderId = params.get("orderId");
    // String resultCode = params.get("resultCode");
    //
    // Payment payment = paymentRepository.findById(orderId)
    // .orElseThrow(() -> new RuntimeException("Payment not found"));
    //
    // String redirectUrl = "http://localhost:3000";
    //
    // if (payment.getBillId() != null) {
    // redirectUrl += "/bill-detail/" + payment.getBillId();
    // } else if (payment.getContractId() != null) {
    // redirectUrl += "/contracts/" + payment.getContractId();
    // } else if (payment.getBookingId() != null) {
    // redirectUrl += "/bookings/" + payment.getBookingId();
    // }
    //
    // redirectUrl += "?payment=" + ("0".equals(resultCode) ? "success" : "failed");
    //
    // response.sendRedirect(redirectUrl);
    // }

    @GetMapping("/momo/return")
    public void momoReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        log.info("🔥 MoMo RETURN received: {}", params);

        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        // ⚠️ SANDBOX FIX: xử lý luôn payment tại đây
        if ("0".equals(resultCode)) {
            paymentService.handleMoMoCallback(
                    orderId,
                    0,
                    transId);
        }

        String redirectUrl = "http://localhost:3000/payment-result"
                + "?status=" + ("0".equals(resultCode) ? "success" : "failed")
                + "&paymentId=" + orderId;

        response.sendRedirect(redirectUrl);
    }

    // MoMo webhook (IPN - Instant Payment Notification)
    @PostMapping("/webhook/momo")
    public ResponseEntity<?> momoWebhook(@RequestBody Map<String, Object> body) {
        log.info("MoMo webhook received - body: {}", body);

        try {
            if (!moMoService.verifyWebhookSignature(body)) {
                log.warn("MoMo webhook rejected due to invalid signature");
                return ResponseEntity.ok(Map.of(
                        "message", "Invalid signature",
                        "resultCode", -1));
            }

            String orderId = (String) body.get("orderId");
            Integer resultCode = (Integer) body.get("resultCode");
            String transId = String.valueOf(body.get("transId"));

            paymentService.handleMoMoCallback(orderId, resultCode, transId);

            return ResponseEntity.ok(Map.of(
                    "message", "Webhook processed successfully",
                    "resultCode", 0));
        } catch (Exception e) {
            log.error("Error processing MoMo webhook", e);
            return ResponseEntity.ok(Map.of(
                    "message", "Webhook processing failed",
                    "resultCode", -1));
        }
    }
}
