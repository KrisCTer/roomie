package com.roomie.services.payment_service.service;

import com.roomie.services.payment_service.dto.event.NotificationEvent;
import com.roomie.services.payment_service.dto.event.PaymentEvent;
import com.roomie.services.payment_service.dto.request.PaymentRequest;
import com.roomie.services.payment_service.dto.response.PaymentResponse;
import com.roomie.services.payment_service.entity.Payment;
import com.roomie.services.payment_service.mapper.PaymentMapper;
import com.roomie.services.payment_service.repository.PaymentRepository;
import com.roomie.services.payment_service.repository.httpclient.BillClient;
import com.roomie.services.payment_service.repository.httpclient.ContractClient;
import com.roomie.services.payment_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    PaymentRepository paymentRepository;
    VNPayService vnPayService;
    MoMoService moMoService;
    ProfileClient profileClient;
    ContractClient contractClient;
    BillClient billingClient;
    PaymentMapper paymentMapper;
    KafkaTemplate<String, Object> kafkaTemplate;

    // Tạo payment & trả URL thanh toán
    public Payment createPayment(PaymentRequest req) {
        Payment payment = Payment.builder()
                .bookingId(req.getBookingId())
                .billId(req.getBillId())
                .contractId(req.getContractId())
                .amount(req.getAmount())
                .description(req.getDescription())
                .method(req.getMethod())
                .status("PENDING")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        String paymentUrl = generatePaymentUrl(saved);

        saved.setPaymentUrl(paymentUrl);
        saved.setUpdatedAt(Instant.now());

        Payment updated = paymentRepository.save(saved);

        PaymentEvent event = buildPaymentEvent(updated);
        kafkaTemplate.send("payment.created", event);
        log.info("Published payment.created event for paymentId={}", updated.getId());

        return saved;
    }

    private String generatePaymentUrl(Payment payment) {
        switch (payment.getMethod()) {
            case "VNPAY":
                return vnPayService.createPaymentUrl(
                        payment.getId(),
                        payment.getAmount(),
                        "Thanh toan Roomie: " + payment.getDescription());
            case "MOMO":
                return moMoService.createPaymentUrl(
                        payment.getId(),
                        payment.getAmount(),
                        "Thanh toan Roomie: " + payment.getDescription());
            case "CASH":
                return null;
            default:
                throw new RuntimeException("Unsupported payment method");
        }
    }

    public PaymentResponse handleVnPayCallback(String transactionId, String status) {
        Payment payment = paymentRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        payment.setUpdatedAt(Instant.now());

        if ("COMPLETED".equalsIgnoreCase(status)) {
            payment.setPaidAt(Instant.now());
        }

        Payment updated = paymentRepository.save(payment);

        PaymentEvent event = buildPaymentEvent(updated);

        if ("COMPLETED".equalsIgnoreCase(status)) {

            kafkaTemplate.send("payment.completed", event);

            if (updated.getContractId() != null) {
                try {
                    contractClient.onPaymentCompleted(updated.getContractId());
                    log.info("Marked payment completed for contractId={}", updated.getContractId());
                } catch (Exception e) {
                    log.error("Failed to mark payment completed for contractId={}",
                            updated.getContractId(), e);
                }
            }

            if (updated.getBillId() != null) {
                try {
                    billingClient.payBill(updated.getBillId(), updated.getId());
                    log.info("Marked bill {} as PAID via paymentId={}",
                            updated.getBillId(), updated.getId());
                } catch (Exception e) {
                    log.error("Failed to mark bill as PAID, billId={}",
                            updated.getBillId(), e);
                }
            }
        } else {
            kafkaTemplate.send("payment.failed", event);
            log.info("Published payment.failed event for paymentId={}", updated.getId());
        }

        return paymentMapper.toResponse(updated);
    }

    /**
     * Handle MoMo payment callback (from both return URL and webhook IPN).
     *
     * <p>Idempotent: safely ignores duplicate callbacks for the same payment.
     * On success, publishes Kafka event and updates billing/contract services.
     *
     * @param orderId   payment ID (same as our internal payment ID)
     * @param resultCode MoMo result code (0 = success, others = failure)
     * @param transId   MoMo transaction ID for reference
     * @return updated payment response
     * @throws AppException if payment not found
     */
    public PaymentResponse handleMoMoCallback(String orderId, Integer resultCode, String transId) {
        Payment payment = paymentRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        String status = Integer.valueOf(0).equals(resultCode) ? "COMPLETED" : "FAILED";

        // Idempotency guard: avoid duplicate side effects when both returnUrl and
        // webhook hit.
        if ("COMPLETED".equalsIgnoreCase(payment.getStatus())) {
            log.info(
                    "Skip duplicate MoMo callback for paymentId={}, currentStatus={}, incomingStatus={}, transId={}",
                    payment.getId(), payment.getStatus(), status, transId);
            return paymentMapper.toResponse(payment);
        }

        if ("FAILED".equalsIgnoreCase(payment.getStatus()) && "FAILED".equalsIgnoreCase(status)) {
            log.info(
                    "Skip duplicated failed MoMo callback for paymentId={}, transId={}",
                    payment.getId(), transId);
            return paymentMapper.toResponse(payment);
        }

        payment.setStatus(status);
        payment.setTransactionId(transId);
        payment.setUpdatedAt(Instant.now());

        if ("COMPLETED".equalsIgnoreCase(status)) {
            payment.setPaidAt(Instant.now());
        }

        Payment updated = paymentRepository.save(payment);

        PaymentEvent event = buildPaymentEvent(updated);

        if ("COMPLETED".equalsIgnoreCase(status)) {

            kafkaTemplate.send("payment.completed", event);

            if (updated.getContractId() != null) {
                try {
                    contractClient.onPaymentCompleted(updated.getContractId());
                    log.info("Marked payment completed for contractId={}", updated.getContractId());
                } catch (Exception e) {
                    log.error("Failed to mark payment completed for contractId={}",
                            updated.getContractId(), e);
                }
            }

            if (updated.getBillId() != null) {
                try {
                    billingClient.payBill(updated.getBillId(), updated.getId());
                    log.info("Marked bill {} as PAID via paymentId={}",
                            updated.getBillId(), updated.getId());
                } catch (Exception e) {
                    log.error("Failed to mark bill as PAID, billId={}",
                            updated.getBillId(), e);
                }
            }
        } else {
            kafkaTemplate.send("payment.failed", event);
            log.info("Published payment.failed event for paymentId={}", updated.getId());
        }

        return paymentMapper.toResponse(updated);
    }

    public PaymentResponse handleCashPayment(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("COMPLETED");
        payment.setPaidAt(Instant.now());
        payment.setUpdatedAt(Instant.now());
        Payment updated = paymentRepository.save(payment);

        PaymentEvent event = buildPaymentEvent(updated);
        kafkaTemplate.send("payment.completed", event);
        log.info("Published payment.completed event for cash payment={}", updated.getId());

        if (updated.getContractId() != null) {
            try {
                contractClient.onPaymentCompleted(updated.getContractId());
                log.info("Marked payment completed for contractId={}", updated.getContractId());
            } catch (Exception e) {
                log.error("Failed to mark payment completed for contractId={}",
                        updated.getContractId(), e);
            }
        }

        return paymentMapper.toResponse(updated);
    }

    public PaymentResponse getPayment(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return paymentMapper.toResponse(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByUser(String userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByContract(String contractId) {
        return paymentRepository.findByContractId(contractId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    private PaymentEvent buildPaymentEvent(Payment payment) {
        String userName = "Unknown User";

        try {
            if (payment.getUserId() != null) {
                var userProfile = profileClient.getProfile(payment.getUserId());
                if (userProfile != null && userProfile.getResult() != null) {
                    userName = userProfile.getResult().getFirstName();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user profile for payment event", e);
        }

        return PaymentEvent.builder()
                .paymentId(payment.getId())
                .userId(payment.getUserId())
                .userName(userName)
                .bookingId(payment.getBookingId())
                .contractId(payment.getContractId())
                .billId(payment.getBillId())
                .amount(BigDecimal.valueOf(payment.getAmount()))
                .currency("VND")
                .paymentMethod(payment.getMethod())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .description(payment.getDescription())
                .build();
    }
}
