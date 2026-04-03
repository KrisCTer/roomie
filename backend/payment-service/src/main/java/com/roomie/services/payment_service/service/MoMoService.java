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
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * MoMo Payment Gateway Integration Service.
 *
 * <p>Handles communication with MoMo V2 Gateway API:
 * <ul>
 *   <li>Creating payment URLs via captureWallet request type</li>
 *   <li>HMAC-SHA256 signature generation and verification</li>
 *   <li>Webhook IPN signature validation with dual-format support</li>
 * </ul>
 *
 * @see <a href="https://developers.momo.vn/v3/docs/payment/api/wallet/onetime">MoMo API Docs</a>
 */
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

    static final String MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    static final ObjectMapper mapper = new ObjectMapper();
    final OkHttpClient client = new OkHttpClient();

    /**
     * Creates a MoMo payment URL using captureWallet request type.
     *
     * @param transactionId unique payment ID (used as orderId and requestId)
     * @param amount        payment amount in VND (>= 1000)
     * @param orderInfo     description shown on MoMo payment screen
     * @return payment URL for frontend redirect
     * @throws RuntimeException if MoMo API call fails
     */
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
