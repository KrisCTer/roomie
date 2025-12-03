package com.roomie.services.payment_service.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MoMoService {
    @Value("${momo.partnerCode}")
    private String partnerCode = "${momo.partnerCode}";

    @Value("${momo.accessKey}")
    private String accessKey = "${momo.accessKey}";

    @Value("${momo.secretKey}")
    private String secretKey = "${momo.secretKey}";

    @Value("${momo.returnUrl}")
    private String returnUrl =  "${momo.returnUrl}";

    @Value("${momo.notifyUrl}")
    private String notifyUrl =  "${momo.notifyUrl}";

    public String createPaymentUrl(String transactionId, double amount, String orderInfo) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("partnerCode", partnerCode);
            params.put("accessKey", accessKey);
            params.put("requestId", transactionId);
            params.put("amount", String.valueOf((long)amount));
            params.put("orderId", transactionId);
            params.put("orderInfo", orderInfo);
            params.put("returnUrl", returnUrl);
            params.put("notifyUrl", notifyUrl);
            params.put("extraData", "");
            params.put("requestType", "captureWallet");

            String rawHash = params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .reduce((a,b)->a+"&"+b).orElse("");

            String signature = hmacSHA256(rawHash, secretKey);
            params.put("signature", signature);

            // TODO: gọi API MoMo để trả về payUrl, giả lập test:
            return "https://test-payment.momo.vn/pay/" + transactionId;
        } catch(Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String hmacSHA256(String data, String key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes());
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
