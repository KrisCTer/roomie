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

/**
 * Payment REST Controller.
 *
 * <p>Provides endpoints for:
 * <ul>
 *   <li>Creating payments (MoMo, VNPay, Cash)</li>
 *   <li>Querying payment status</li>
 *   <li>Handling payment gateway callbacks (MoMo return URL, MoMo webhook IPN, VNPay callback)</li>
 * </ul>
 *
 * <p>Payment flow for MoMo:
 * <pre>
 *   1. Frontend calls POST /payment with method=MOMO
 *   2. Backend creates Payment record (PENDING) and calls MoMo API
 *   3. MoMo returns payUrl → backend saves it and returns to frontend
 *   4. Frontend redirects user to payUrl
 *   5. After payment, MoMo redirects to GET /payment/momo/return
 *   6. MoMo also sends POST /payment/webhook/momo (IPN) for server-to-server confirmation
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    MoMoService moMoService;

    /**
     * Create a new payment transaction.
     *
     * <p>Accepts payment details including method (MOMO/VNPAY/CASH), creates a
     * Payment record in MongoDB with status PENDING, calls the appropriate payment
     * gateway to generate a payment URL, and returns the Payment object with paymentUrl.
     *
     * @param req payment request containing billId, amount, method, description
     * @return the created Payment entity with paymentUrl for gateway redirect
     */
    @PostMapping
    public ApiResponse<Payment> createPayment(@RequestBody PaymentRequest req) {
        return ApiResponse.success(paymentService.createPayment(req), "Payment created");
    }

    /**
     * Get payment details by ID.
     *
     * <p>Returns the current state of a payment including its status
     * (PENDING, COMPLETED, FAILED), transaction ID from the gateway,
     * and timestamp information.
     *
     * @param id the payment ID
     * @return payment details wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable String id) {
        return ApiResponse.success(paymentService.getPayment(id), "Get payment by id successful");
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.success(paymentService.getAllPayments(), "Get all payment successful");
    }

    @GetMapping("/webhook/vnpay")
    public void vnPayCallback(
            @RequestParam String transactionId,
            @RequestParam String status,
            HttpServletResponse response) throws IOException {
        log.info("VNPay callback received - transactionId: {}, status: {}", transactionId, status);

        PaymentResponse payment = paymentService.handleVnPayCallback(transactionId, status);

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

    /**
     * MoMo return URL handler.
     *
     * <p>Called when MoMo redirects the user back after completing (or cancelling)
     * payment on MoMo's page. Processes the result and redirects to the frontend
     * payment result page.
     *
     * @param params query parameters from MoMo including orderId, resultCode, transId
     * @param response HTTP response for redirect
     */
    @GetMapping("/momo/return")
    public void momoReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        log.info("MoMo RETURN received: {}", params);

        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        if ("0".equals(resultCode)) {
            paymentService.handleMoMoCallback(orderId, 0, transId);
        }

        String redirectUrl = "http://localhost:3000/payment-result"
                + "?status=" + ("0".equals(resultCode) ? "success" : "failed")
                + "&paymentId=" + orderId;

        response.sendRedirect(redirectUrl);
    }

    /**
     * MoMo IPN (Instant Payment Notification) webhook handler.
     *
     * <p>Server-to-server callback from MoMo confirming payment result.
     * This is more reliable than the return URL since it doesn't depend
     * on the user's browser.
     *
     * <p>Validates the HMAC-SHA256 signature before processing.
     * Idempotent: duplicate callbacks for the same payment are safely ignored.
     *
     * @param body the full webhook payload from MoMo
     * @return acknowledgement response to MoMo
     */
    @PostMapping("/webhook/momo")
    public ResponseEntity<?> momoWebhook(@RequestBody Map<String, Object> body) {
        log.info("MoMo webhook received - body: {}", body);

        try {
            if (!moMoService.verifyWebhookSignature(body)) {
                log.warn("MoMo webhook rejected due to invalid signature");
                return ResponseEntity.ok(Map.of("message", "Invalid signature", "resultCode", -1));
            }

            String orderId = (String) body.get("orderId");
            Integer resultCode = (Integer) body.get("resultCode");
            String transId = String.valueOf(body.get("transId"));

            paymentService.handleMoMoCallback(orderId, resultCode, transId);

            return ResponseEntity.ok(Map.of("message", "Webhook processed successfully", "resultCode", 0));
        } catch (Exception e) {
            log.error("Error processing MoMo webhook", e);
            return ResponseEntity.ok(Map.of("message", "Webhook processing failed", "resultCode", -1));
        }
    }
}
