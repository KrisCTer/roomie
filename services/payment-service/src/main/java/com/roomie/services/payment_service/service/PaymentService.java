package com.roomie.services.payment_service.service;

import com.roomie.services.payment_service.dto.request.PaymentRequest;
import com.roomie.services.payment_service.dto.response.PaymentResponse;
import com.roomie.services.payment_service.entity.Payment;
import com.roomie.services.payment_service.mapper.PaymentMapper;
import com.roomie.services.payment_service.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

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
    PaymentMapper paymentMapper = PaymentMapper.INSTANCE;

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

        paymentRepository.save(saved);

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

    // Xử lý callback VNPay
    public PaymentResponse handleVnPayCallback(String transactionId, String status) {
        Payment payment = paymentRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(status);
        payment.setUpdatedAt(Instant.now());
        Payment updated = paymentRepository.save(payment);

        // TODO: publish PaymentCompleted event nếu status = COMPLETED
        return paymentMapper.toResponse(updated);
    }

    // Xử lý callback MoMo
    public PaymentResponse handleMoMoCallback(String transactionId, String status) {
        Payment payment = paymentRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(status);
        payment.setUpdatedAt(Instant.now());
        Payment updated = paymentRepository.save(payment);

        // TODO: publish PaymentCompleted event nếu status = COMPLETED
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
}
