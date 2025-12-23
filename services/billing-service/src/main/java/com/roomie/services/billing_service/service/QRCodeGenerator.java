package com.roomie.services.billing_service.service;


import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * QR Code Generator Utility
 * Tạo QR code cho thanh toán MoMo
 */
@Slf4j
public class QRCodeGenerator {

    /**
     * Tạo QR code image từ text
     *
     * @param text Text để encode vào QR code
     * @param width Width của QR code (pixels)
     * @param height Height của QR code (pixels)
     * @return BufferedImage của QR code
     */
    public static BufferedImage generateQRCodeImage(String text, int width, int height)
            throws WriterException, IOException {

        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1); // Margin nhỏ để QR code to hơn

        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    /**
     * Tạo QR code cho MoMo payment
     * Format: https://nhantien.momo.vn/{PHONE_NUMBER}
     *
     * @param phoneNumber Số điện thoại MoMo
     * @param amount Số tiền
     * @param note Nội dung chuyển khoản
     * @param width Width của QR code
     * @param height Height của QR code
     * @return BufferedImage của QR code
     */
    public static BufferedImage generateMoMoQRCode(
            String phoneNumber,
            long amount,
            String note,
            int width,
            int height
    ) throws WriterException, IOException {

        // Format MoMo deep link
        // https://nhantien.momo.vn/{phone}?amount={amount}&note={note}
        String momoUrl = String.format(
                "https://nhantien.momo.vn/%s?amount=%d&note=%s",
                phoneNumber,
                amount,
                note.replace(" ", "+")
        );

        log.debug("Generated MoMo QR code URL: {}", momoUrl);

        return generateQRCodeImage(momoUrl, width, height);
    }

    /**
     * Tạo QR code cho VietQR (Bank transfer)
     * Format: https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={INFO}
     *
     * @param bankCode Mã ngân hàng (VD: VCB, ACB, TCB)
     * @param accountNumber Số tài khoản
     * @param accountName Tên tài khoản
     * @param amount Số tiền
     * @param content Nội dung chuyển khoản
     * @param width Width của QR code
     * @param height Height của QR code
     * @return BufferedImage của QR code
     */
    public static BufferedImage generateVietQRCode(
            String bankCode,
            String accountNumber,
            String accountName,
            long amount,
            String content,
            int width,
            int height
    ) throws WriterException, IOException {

        // VietQR API format
        String vietQRUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                bankCode,
                accountNumber,
                amount,
                content.replace(" ", "+"),
                accountName.replace(" ", "+")
        );

        log.debug("Generated VietQR URL: {}", vietQRUrl);

        return generateQRCodeImage(vietQRUrl, width, height);
    }

    /**
     * Tạo QR code đơn giản từ text
     * Sử dụng cho các trường hợp chung
     */
    public static BufferedImage generateSimpleQRCode(String text, int size)
            throws WriterException, IOException {
        return generateQRCodeImage(text, size, size);
    }
}