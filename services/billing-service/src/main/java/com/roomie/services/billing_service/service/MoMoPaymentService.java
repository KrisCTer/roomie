package com.roomie.services.billing_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.roomie.services.billing_service.dto.response.MoMoPaymentResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.*;

/**
 * MoMo Payment Integration Service (FIXED)
 *
 * Fix: MoMo test environment không trả về qrCodeUrl
 * Solution: Generate QR code từ payUrl
 */
@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoMoPaymentService {

    @Value("${billing.payment.momo.partnerCode}")
    String partnerCode;

    @Value("${billing.payment.momo.accessKey}")
    String accessKey;

    @Value("${billing.payment.momo.secretKey}")
    String secretKey;

    @Value("${billing.payment.momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    String momoEndpoint;

    @Value("${billing.payment.momo.returnUrl}")
    String returnUrl;

    @Value("${billing.payment.momo.notifyUrl}")
    String notifyUrl;

    static final ObjectMapper mapper = new ObjectMapper();
    final OkHttpClient client = new OkHttpClient();

    /**
     * Tạo payment transaction với MoMo
     *
     * @param billId Bill ID (dùng làm orderId)
     * @param amount Số tiền
     * @param orderInfo Mô tả đơn hàng
     * @return MoMoPaymentResponse với payUrl (và qrCodeUrl nếu có)
     */
    public MoMoPaymentResponse createPaymentQR(String billId, long amount, String orderInfo) {
        try {
            String requestId = billId;
            String orderId = billId;
            String requestType = "captureWallet";
            String extraData = "";

            // Build rawSignature theo chuẩn MoMo
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

            log.debug("MoMo request body: {}", jsonBody);

            // Call MoMo API
            Request request = new Request.Builder()
                    .url(momoEndpoint)
                    .post(RequestBody.create(jsonBody, MediaType.get("application/json")))
                    .build();

            Response response = client.newCall(request).execute();
            String responseBody = response.body().string();

            log.info("MoMo response: {}", responseBody);

            // Parse response
            Map<?, ?> res = mapper.readValue(responseBody, Map.class);

            Integer resultCode = (Integer) res.get("resultCode");
            if (resultCode != 0) {
                throw new RuntimeException("MoMo API error: " + res.get("message"));
            }

            // Extract URLs
            String payUrl = (String) res.get("payUrl");
            String qrCodeUrl = (String) res.get("qrCodeUrl");
            String deeplink = (String) res.get("deeplink");

            log.info("✅ MoMo payment created successfully");
            log.info("   Pay URL: {}", payUrl);
            log.info("   QR Code URL: {}", qrCodeUrl);

            // ⚠️ FIX: MoMo test không trả về qrCodeUrl
            // Solution: Generate QR code từ payUrl
            if (qrCodeUrl == null || qrCodeUrl.isEmpty()) {
                log.warn("⚠️ MoMo didn't return qrCodeUrl (test environment)");
                log.info("💡 Will generate QR code from payUrl instead");
            }

            return MoMoPaymentResponse.builder()
                    .orderId(orderId)
                    .requestId(requestId)
                    .payUrl(payUrl)
                    .qrCodeUrl(qrCodeUrl) // Có thể null
                    .deeplink(deeplink)
                    .message("Success")
                    .build();

        } catch (Exception e) {
            log.error("❌ MoMo payment creation failed", e);
            throw new RuntimeException("Failed to create MoMo payment: " + e.getMessage(), e);
        }
    }

    /**
     * Generate QR code từ URL (fallback method)
     * Dùng khi MoMo không trả về qrCodeUrl
     *
     * @param url URL để encode vào QR code (payUrl từ MoMo)
     * @param width Width của QR code
     * @param height Height của QR code
     * @return byte[] của QR code image
     */
    public byte[] generateQRCodeFromUrl(String url, int width, int height) {
        try {
            log.info("🔄 Generating QR code from URL: {}", url.substring(0, Math.min(50, url.length())) + "...");

            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, width, height, hints);

            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            // Convert to byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            log.info("✅ QR code generated successfully, size: {} bytes", imageBytes.length);

            return imageBytes;

        } catch (Exception e) {
            log.error("❌ Failed to generate QR code from URL", e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }

    /**
     * Download QR code image từ MoMo qrCodeUrl
     * (Chỉ dùng khi MoMo trả về qrCodeUrl - production environment)
     *
     * @param qrCodeUrl URL của QR code từ MoMo
     * @return byte[] của QR code image
     */
    public byte[] downloadQRCodeImage(String qrCodeUrl) {
        // Validate URL
        if (qrCodeUrl == null || qrCodeUrl.isEmpty()) {
            throw new IllegalArgumentException("qrCodeUrl is null or empty");
        }

        try {
            log.info("Downloading QR code from: {}", qrCodeUrl);

            Request request = new Request.Builder()
                    .url(qrCodeUrl)
                    .get()
                    .build();

            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to download QR code: " + response.code());
            }

            byte[] qrImageBytes = response.body().bytes();

            log.info("✅ QR code downloaded successfully, size: {} bytes", qrImageBytes.length);

            return qrImageBytes;

        } catch (Exception e) {
            log.error("❌ Failed to download QR code image", e);
            throw new RuntimeException("Failed to download QR code: " + e.getMessage(), e);
        }
    }

    /**
     * Get QR code image - Smart method
     * - Nếu có qrCodeUrl → download từ MoMo
     * - Nếu không có qrCodeUrl → generate từ payUrl
     *
     * @param momoResponse MoMo payment response
     * @param width QR code width
     * @param height QR code height
     * @return byte[] của QR code image
     */
    public byte[] getQRCodeImage(MoMoPaymentResponse momoResponse, int width, int height) {
        // Option 1: Download từ MoMo (production)
        if (momoResponse.getQrCodeUrl() != null && !momoResponse.getQrCodeUrl().isEmpty()) {
            log.info("✅ Using qrCodeUrl from MoMo");
            return downloadQRCodeImage(momoResponse.getQrCodeUrl());
        }

        // Option 2: Generate từ payUrl (test/fallback)
        if (momoResponse.getPayUrl() != null && !momoResponse.getPayUrl().isEmpty()) {
            log.info("💡 qrCodeUrl not available, generating QR from payUrl");
            return generateQRCodeFromUrl(momoResponse.getPayUrl(), width, height);
        }

        throw new RuntimeException("No URL available to generate QR code");
    }

    /**
     * Check payment status từ MoMo
     */
    public String checkPaymentStatus(String orderId, String requestId) {
        try {
            String rawSignature =
                    "accessKey=" + accessKey +
                            "&orderId=" + orderId +
                            "&partnerCode=" + partnerCode +
                            "&requestId=" + requestId;

            String signature = hmacSHA256(rawSignature, secretKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("orderId", orderId);
            body.put("requestId", requestId);
            body.put("signature", signature);
            body.put("lang", "vi");

            String jsonBody = mapper.writeValueAsString(body);

            Request request = new Request.Builder()
                    .url("https://test-payment.momo.vn/v2/gateway/api/query")
                    .post(RequestBody.create(jsonBody, MediaType.get("application/json")))
                    .build();

            Response response = client.newCall(request).execute();
            String responseBody = response.body().string();

            Map<?, ?> res = mapper.readValue(responseBody, Map.class);

            Integer resultCode = (Integer) res.get("resultCode");

            if (resultCode == 0) {
                return "PAID";
            } else if (resultCode == 1000) {
                return "PENDING";
            } else {
                return "FAILED";
            }

        } catch (Exception e) {
            log.error("Failed to check payment status", e);
            return "UNKNOWN";
        }
    }

    /**
     * HMAC SHA256 signature
     */
    private String hmacSHA256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes());
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}