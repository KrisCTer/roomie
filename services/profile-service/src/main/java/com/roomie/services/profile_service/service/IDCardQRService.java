package com.roomie.services.profile_service.service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.roomie.services.profile_service.dto.response.IDCardInfo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class IDCardQRService {
    public IDCardInfo extractFromFile(MultipartFile file) {

        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            LuminanceSource source = new BufferedImageLuminanceSource(image);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

            Result result = new MultiFormatReader().decode(bitmap);
            String qrText = result.getText();

            log.info("QR RAW: {}", qrText);

            return parseVietnameseIDCardQR(qrText);

        } catch (NotFoundException e) {
            throw new RuntimeException("QR code not found in image");
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract QR code info: " + e.getMessage(), e);
        }
    }

    private IDCardInfo parseVietnameseIDCardQR(String qrText) {

        String[] parts = qrText.split("\\|");
        if (parts.length < 7) {
            throw new RuntimeException("Invalid Vietnam IDCard QR format");
        }

        IDCardInfo info = new IDCardInfo();
        info.setIdNumber(parts[0].trim());
        info.setFullName(parts[2].trim());
        info.setDob(formatDate(parts[3].trim()));
        info.setGender(parts[4].trim());
        info.setAddress(parts[5].trim());

        return info;
    }

    private String formatDate(String ddMMyyyy) {
        if (ddMMyyyy == null || ddMMyyyy.length() != 8) return ddMMyyyy;
        return ddMMyyyy.substring(4, 8) + "-" + ddMMyyyy.substring(2, 4) + "-" + ddMMyyyy.substring(0, 2);
    }

}
