package com.roomie.services.profile_service.service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.roomie.services.profile_service.dto.response.IDCardInfo;
import com.roomie.services.profile_service.exception.AppException;
import com.roomie.services.profile_service.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.time.LocalDate;

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
            throw new AppException(ErrorCode.QR_NOT_FOUND_IN_IMAGE);
        } catch (Exception e) {
            throw new AppException(ErrorCode.QR_EXTRACTION_FAILED,e.getMessage());
        }
    }

    private IDCardInfo parseVietnameseIDCardQR(String qrText) {

        String[] parts = qrText.split("\\|");
        if (parts.length < 7) {
            throw new AppException(ErrorCode.INVALID_IDCARD);
        }

        IDCardInfo info = new IDCardInfo();
        info.setIdNumber(parts[0].trim());
        info.setFullName(parts[2].trim());
        info.setDob(formatDate(parts[3].trim()));
        info.setGender(parts[4].trim());
        info.setAddress(parts[5].trim());

        return info;
    }

    private LocalDate  formatDate(String ddMMyyyy) {
        if (ddMMyyyy == null || ddMMyyyy.length() != 8) {
            throw new AppException(ErrorCode.INVALID_IDCARD);
        }
        String normalized = ddMMyyyy.substring(4, 8) + "-" +
                ddMMyyyy.substring(2, 4) + "-" +
                ddMMyyyy.substring(0, 2);
        return LocalDate.parse(normalized);
    }

}
