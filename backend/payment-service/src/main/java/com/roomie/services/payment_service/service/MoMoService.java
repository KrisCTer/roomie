package com.roomie.services.payment_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoMoService {

    @Value("${momo.partnerCode}")
    String partnerCode;

    @Value("${momo.accessKey}")
    String accessKey;

    @Value("${momo.secretKey}")
    String secretKey;

    @Value("${momo.returnUrl}")
    String returnUrl;

    @Value("${momo.notifyUrl}")
    String notifyUrl;

    static final String MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    static final ObjectMapper mapper = new ObjectMapper();
    final OkHttpClient client = new OkHttpClient();

    public String createPaymentUrl(String transactionId, long amount, String orderInfo) {
        try {
            String requestId = transactionId;
            String orderId = transactionId;
            String requestType = "captureWallet";
            String extraData = "";

            // Build rawSignature đúng chuẩn MoMo
            String rawSignature =
                    "accessKey=" + accessKey +
                            "&amount=" + amount +
                            "&extraData=" + extraData +
                            "&ipnUrl=" + notifyUrl +
                            "&orderId=" + orderId +
                            "&orderInfo=" + orderInfo +
                            "&partnerCode=" + partnerCode +
                            "&redirectUrl=" + returnUrl +
                            "&requestId=" + requestId +
                            "&requestType=" + requestType;

            String signature = hmacSHA256(rawSignature, secretKey);

            // Build request body
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("partnerName", "Roomie");
            body.put("storeId", "Roomie");
            body.put("requestId", requestId);
            body.put("amount", amount);
            body.put("orderId", orderId);
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", returnUrl);
            body.put("ipnUrl", notifyUrl);
            body.put("lang", "vi");
            body.put("extraData", extraData);
            body.put("requestType", requestType);
            body.put("signature", signature);

            String jsonBody = mapper.writeValueAsString(body);

            Request request = new Request.Builder()
                    .url(MOMO_ENDPOINT)
                    .post(RequestBody.create(jsonBody, MediaType.get("application/json")))
                    .build();

            Response response = client.newCall(request).execute();
            String responseBody = response.body().string();

            log.info("MoMo response: {}", responseBody);

            Map<?, ?> res = mapper.readValue(responseBody, Map.class);

            return (String) res.get("payUrl");

        } catch (Exception e) {
            log.error("MoMo createPaymentUrl ERROR", e);
            throw new RuntimeException("MoMo payment error: " + e.getMessage());
        }
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes());
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
