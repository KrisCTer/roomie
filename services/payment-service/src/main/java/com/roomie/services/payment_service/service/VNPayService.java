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
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayService {

    @Value("${vnpay.merchantCode}")
    String merchantCode;

    @Value("${vnpay.secretKey}")
    String secretKey;

    @Value("${vnpay.returnUrl}")
    String returnUrl;

    public String createPaymentUrl(String transactionId, double amount, String orderInfo) {
        try {

            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", merchantCode);

            params.put("vnp_Amount", String.valueOf((long) (amount * 100)));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", transactionId);
            params.put("vnp_OrderInfo", orderInfo);

            // dùng chuẩn VNPay
            params.put("vnp_OrderType", "other");

            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", returnUrl);

            params.put("vnp_IpAddr", "127.0.0.1");

            String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            params.put("vnp_CreateDate", createDate);

            Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            cal.add(Calendar.MINUTE, 15);
            String expireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());
            params.put("vnp_ExpireDate", expireDate);

            // Sắp xếp field theo bảng chữ cái
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);

                if (fieldValue != null && fieldValue.length() > 0) {

                    // 1️⃣ HASH DATA — ENCODE THEO DEMO CHUẨN
                    hashData.append(fieldName)
                            .append("=")
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    // 2️⃣ QUERY STRING
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append("=");
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    if (itr.hasNext()) {
                        hashData.append("&");
                        query.append("&");
                    }
                }
            }

            String secureHash = hmacSHA512(secretKey, hashData.toString());
            query.append("&vnp_SecureHash=").append(secureHash);

            String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + query;

            return paymentUrl;

        } catch (Exception e) {
            log.error("VNPay error", e);
            throw new RuntimeException("Could not create VNPay URL");
        }
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac.init(secretKeySpec);

        byte[] result = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : result) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
