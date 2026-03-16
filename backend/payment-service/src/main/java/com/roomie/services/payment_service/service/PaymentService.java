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
    BillClient  billingClient;
    PaymentMapper paymentMapper = PaymentMapper.INSTANCE;
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
                        "Thanh toan Roomie: " + payment.getDescription()
                );
            case "MOMO":
                return moMoService.createPaymentUrl(
                        payment.getId(),
                        payment.getAmount(),
                        "Thanh toan Roomie: " + payment.getDescription()
                );
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
        }
        else {
            kafkaTemplate.send("payment.failed", event);
            log.info("Published payment.failed event for paymentId={}", updated.getId());
        }

        return paymentMapper.toResponse(updated);
    }

    public PaymentResponse handleMoMoCallback(String orderId, Integer resultCode, String transId) {
        Payment payment = paymentRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        String status = (resultCode == 0) ? "COMPLETED" : "FAILED";

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
        }
        else {
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
