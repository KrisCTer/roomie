package com.roomie.services.payment_service.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayService {
    @Value("${vnpay.merchantCode}")
    String merchantCode = "${vnpay.merchantCode}";

    @Value("${vnpay.secretKey}")
    String secretKey = "${vnpay.secretKey}";

    @Value("${vnpay.returnUrl}")
    String returnUrl = "${vnpay.returnUrl}";

    public String createPaymentUrl(String transactionId, double amount, String orderInfo) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", merchantCode);
            params.put("vnp_Amount", String.valueOf((long)(amount * 100)));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", transactionId);
            params.put("vnp_OrderInfo", orderInfo);
            params.put("vnp_ReturnUrl", returnUrl);
            params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

            String query = params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                    .reduce((a, b) -> a + "&" + b).orElse("");

            String hash = HmacSHA512(secretKey, query);

            return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + query + "&vnp_SecureHash=" + hash;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String HmacSHA512(String key, String data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA512");
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(secretKey);
        byte[] bytes = mac.doFinal(data.getBytes());
        StringBuilder sb = new StringBuilder();
        for(byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
