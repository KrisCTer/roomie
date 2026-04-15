package com.roomie.services.payment_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomie.services.payment_service.exception.AppException;
import com.roomie.services.payment_service.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.net.SocketTimeoutException;
import java.time.Duration;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoMoService {

    private static final List<String> IPN_SIGNATURE_KEYS = List.of(
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

    private static final List<String> IPN_SIGNATURE_KEYS_NO_ACCESS_KEY = List.of(
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

    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    String endpoint;

    @Value("${momo.timeout.connect-ms:5000}")
    long connectTimeoutMs;

    @Value("${momo.timeout.read-ms:12000}")
    long readTimeoutMs;

    @Value("${momo.timeout.write-ms:5000}")
    long writeTimeoutMs;

    @Value("${momo.timeout.max-retries:1}")
    int maxRetries;

    static final ObjectMapper mapper = new ObjectMapper();

    private OkHttpClient buildClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                .readTimeout(Duration.ofMillis(readTimeoutMs))
                .writeTimeout(Duration.ofMillis(writeTimeoutMs))
                .build();
    }

    public String createPaymentUrl(String transactionId, long amount, String orderInfo) {
        try {
            String requestId = transactionId;
            String orderId = transactionId;
            String requestType = "captureWallet";
            String extraData = "";

            // Build rawSignature đúng chuẩn MoMo
            String rawSignature = "accessKey=" + accessKey +
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
                    .url(endpoint)
                    .post(RequestBody.create(jsonBody, MediaType.get("application/json")))
                    .build();

            int attempts = Math.max(1, maxRetries + 1);
            for (int attempt = 1; attempt <= attempts; attempt++) {
                try (Response response = buildClient().newCall(request).execute()) {
                    String responseBody = response.body() != null ? response.body().string() : "";

                    log.info("MoMo response: {}", responseBody);

                    if (!response.isSuccessful()) {
                        throw new AppException(
                                ErrorCode.PAYMENT_GATEWAY_ERROR,
                                "MoMo returned HTTP " + response.code());
                    }

                    Map<?, ?> res = mapper.readValue(responseBody, Map.class);
                    String payUrl = (String) res.get("payUrl");

                    if (payUrl == null || payUrl.isBlank()) {
                        throw new AppException(
                                ErrorCode.PAYMENT_GATEWAY_ERROR,
                                "MoMo response missing payUrl");
                    }

                    return payUrl;
                } catch (SocketTimeoutException e) {
                    if (attempt == attempts) {
                        throw e;
                    }
                    log.warn("MoMo timeout on attempt {}/{}. Retrying...", attempt, attempts);
                }
            }

            throw new AppException(ErrorCode.PAYMENT_GATEWAY_TIMEOUT);

        } catch (SocketTimeoutException e) {
            log.error("MoMo createPaymentUrl timeout", e);
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_TIMEOUT, e);
        } catch (IOException e) {
            log.error("MoMo createPaymentUrl I/O error", e);
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR, e);
        } catch (AppException e) {
            throw e;

        } catch (Exception e) {
            log.error("MoMo createPaymentUrl ERROR", e);
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR, e);
        }
    }

    public boolean verifyWebhookSignature(Map<String, Object> payload) {
        String receivedSignature = toSafeString(payload.get("signature"));
        if (receivedSignature.isEmpty()) {
            log.warn("MoMo webhook missing signature");
            return false;
        }

        try {
            // MoMo docs differ by API flavor; try both canonical variants to avoid false
            // negatives.
            String rawWithAccessKey = buildRawSignature(payload, IPN_SIGNATURE_KEYS);
            String rawWithoutAccessKey = buildRawSignature(payload, IPN_SIGNATURE_KEYS_NO_ACCESS_KEY);

            String expectedWithAccessKey = hmacSHA256(rawWithAccessKey, secretKey);
            String expectedWithoutAccessKey = hmacSHA256(rawWithoutAccessKey, secretKey);

            return safeEquals(receivedSignature, expectedWithAccessKey)
                    || safeEquals(receivedSignature, expectedWithoutAccessKey);
        } catch (Exception e) {
            log.error("Failed to verify MoMo webhook signature", e);
            return false;
        }
    }

    private String buildRawSignature(Map<String, Object> payload, List<String> keys) {
        StringJoiner joiner = new StringJoiner("&");
        for (String key : keys) {
            if (payload.containsKey(key)) {
                joiner.add(key + "=" + toSafeString(payload.get(key)));
            }
        }
        return joiner.toString();
    }

    private String toSafeString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private boolean safeEquals(String left, String right) {
        return MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash)
            hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
