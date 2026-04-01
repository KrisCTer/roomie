package com.roomie.services.payment_service.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomie.services.payment_service.entity.Payment;
import com.roomie.services.payment_service.controller.PaymentController;
import com.roomie.services.payment_service.dto.response.PaymentResponse;
import com.roomie.services.payment_service.repository.PaymentRepository;
import com.roomie.services.payment_service.repository.httpclient.BillClient;
import com.roomie.services.payment_service.repository.httpclient.ContractClient;
import com.roomie.services.payment_service.repository.httpclient.ProfileClient;
import com.roomie.services.payment_service.mapper.PaymentMapper;
import com.roomie.services.payment_service.service.MoMoService;
import com.roomie.services.payment_service.service.PaymentService;
import com.roomie.services.payment_service.service.VNPayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.StringJoiner;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({ PaymentService.class, MoMoService.class })
@TestPropertySource(properties = {
        "momo.partnerCode=MOMO_TEST_PARTNER",
        "momo.accessKey=MOMO_TEST_ACCESS_KEY",
        "momo.secretKey=MOMO_TEST_SECRET_KEY"
})
class MoMoWebhookIntegrationTest {

    private static final String PAYMENT_ID = "pay-momo-001";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentRepository paymentRepository;

    @MockBean
    private VNPayService vnPayService;

    @MockBean
    private ProfileClient profileClient;

    @MockBean
    private ContractClient contractClient;

    @MockBean
    private BillClient billClient;

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @MockBean
    private PaymentMapper paymentMapper;

    private AtomicReference<Payment> paymentStore;

    @BeforeEach
    void setUp() {
        paymentStore = new AtomicReference<>(Payment.builder()
                .id(PAYMENT_ID)
                .billId("bill-001")
                .amount(200000L)
                .method("MOMO")
                .status("PENDING")
                .description("Thanh toan hoa don")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        when(paymentRepository.findById(eq(PAYMENT_ID)))
                .thenAnswer(invocation -> Optional.ofNullable(paymentStore.get()));

        when(paymentRepository.save(any(Payment.class)))
                .thenAnswer(invocation -> {
                    Payment updated = invocation.getArgument(0);
                    paymentStore.set(updated);
                    return updated;
                });

        when(paymentMapper.toResponse(any(Payment.class)))
                .thenAnswer(invocation -> {
                    Payment payment = invocation.getArgument(0);
                    return PaymentResponse.builder()
                            .id(payment.getId())
                            .billId(payment.getBillId())
                            .contractId(payment.getContractId())
                            .bookingId(payment.getBookingId())
                            .status(payment.getStatus())
                            .transactionId(payment.getTransactionId())
                            .method(payment.getMethod())
                            .build();
                });
    }

    @Test
    void momoWebhook_success_shouldCompletePaymentAndPublishCompletedEvent() throws Exception {
        Map<String, Object> payload = createWebhookPayload(0, "momo-trans-success");

        mockMvc.perform(post("/webhook/momo")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value(0));

        assertThat(paymentStore.get().getStatus()).isEqualTo("COMPLETED");
        assertThat(paymentStore.get().getTransactionId()).isEqualTo("momo-trans-success");

        verify(kafkaTemplate, times(1)).send(eq("payment.completed"), any());
    }

    @Test
    void momoWebhook_failed_shouldMarkFailedAndPublishFailedEvent() throws Exception {
        Map<String, Object> payload = createWebhookPayload(1006, "momo-trans-failed");

        mockMvc.perform(post("/webhook/momo")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value(0));

        assertThat(paymentStore.get().getStatus()).isEqualTo("FAILED");
        assertThat(paymentStore.get().getTransactionId()).isEqualTo("momo-trans-failed");

        verify(kafkaTemplate, times(1)).send(eq("payment.failed"), any());
    }

    @Test
    void momoWebhook_duplicateSuccess_shouldBeIdempotentAndAvoidDuplicateSideEffects() throws Exception {
        Map<String, Object> payload = createWebhookPayload(0, "momo-trans-dup");
        String body = objectMapper.writeValueAsString(payload);

        mockMvc.perform(post("/webhook/momo")
                .contentType(APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value(0));

        mockMvc.perform(post("/webhook/momo")
                .contentType(APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value(0));

        assertThat(paymentStore.get().getStatus()).isEqualTo("COMPLETED");

        verify(kafkaTemplate, times(1)).send(eq("payment.completed"), any());
        verify(billClient, times(1)).payBill(eq("bill-001"), eq(PAYMENT_ID));
    }

    private Map<String, Object> createWebhookPayload(int resultCode, String transId) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", "MOMO_TEST_PARTNER");
        payload.put("accessKey", "MOMO_TEST_ACCESS_KEY");
        payload.put("requestId", PAYMENT_ID);
        payload.put("orderId", PAYMENT_ID);
        payload.put("amount", 200000);
        payload.put("orderInfo", "Thanh toan hoa don");
        payload.put("orderType", "momo_wallet");
        payload.put("transId", transId);
        payload.put("resultCode", resultCode);
        payload.put("message", resultCode == 0 ? "Successful." : "Failed.");
        payload.put("payType", "qr");
        payload.put("responseTime", "1710000000000");
        payload.put("extraData", "");

        payload.put("signature", signPayload(payload));
        return payload;
    }

    private String signPayload(Map<String, Object> payload) throws Exception {
        List<String> orderedKeys = List.of(
                "accessKey",
                "amount",
                "extraData",
                "message",
                "orderId",
                "orderInfo",
                "orderType",
                "partnerCode",
                "payType",
                "requestId",
                "responseTime",
                "resultCode",
                "transId");

        StringJoiner joiner = new StringJoiner("&");
        for (String key : orderedKeys) {
            joiner.add(key + "=" + payload.get(key));
        }

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("MOMO_TEST_SECRET_KEY".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(joiner.toString().getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }

        return hex.toString();
    }
}
