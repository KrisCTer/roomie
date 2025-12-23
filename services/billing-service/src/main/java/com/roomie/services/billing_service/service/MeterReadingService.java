package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.response.FileResponse;
import com.roomie.services.billing_service.entity.MeterReading;
import com.roomie.services.billing_service.exception.AppException;
import com.roomie.services.billing_service.exception.ErrorCode;
import com.roomie.services.billing_service.repository.MeterReadingRepository;
import com.roomie.services.billing_service.repository.httpclient.FileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Meter Reading Service
 * Manages meter readings with photo upload and OCR
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MeterReadingService {

    MeterReadingRepository meterReadingRepository;
    FileClient fileClient;
    MeterOcrService ocrService;
    VietnameseMeterOcrService vietnameseOcrService; // ← NEW

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // ==================== UPLOAD WITH OCR ====================

    /**
     * Upload meter photo and auto-extract reading
     * Uses VIETNAMESE OCR (specialized for VN meters)
     */
    @Transactional
    public MeterReading uploadMeterPhotoWithOcr(
            String meterReadingId,
            MultipartFile file,
            String meterType) {

        log.info("🇻🇳 Uploading {} meter photo with VIETNAMESE OCR for reading: {}",
                meterType, meterReadingId);

        // 1. Validate file
        validateImageFile(file);

        // 2. Get meter reading
        MeterReading reading = getMeterReading(meterReadingId);

        try {
            // 3. Perform OCR using VIETNAMESE specialized service
            VietnameseMeterOcrService.MeterReadingResult ocrResult =
                    vietnameseOcrService.readVietnameseMeter(file);

            log.info("🇻🇳 Vietnamese OCR result: success={}, value={}, confidence={}, strategy={}",
                    ocrResult.isSuccess(), ocrResult.getValue(),
                    ocrResult.getConfidence(), ocrResult.getStrategy());

            // 4. Upload photo to file service
            FileResponse fileResponse = fileClient.uploadFile(
                    file,
                    "METER_READING",
                    meterReadingId
            ).getResult();

            String photoUrl = fileResponse.getPublicUrl();

            // 5. Update meter reading based on type
            switch (meterType.toUpperCase()) {
                case "ELECTRICITY":
                    reading.setElectricityPhotoUrl(photoUrl);
                    if (ocrResult.isSuccess() && ocrResult.getValue() != null) {
                        reading.setElectricityReading(ocrResult.getValue());
                        log.info("✅ Auto-filled electricity reading: {} kWh", ocrResult.getValue());
                    }
                    break;

                case "WATER":
                    reading.setWaterPhotoUrl(photoUrl);
                    if (ocrResult.isSuccess() && ocrResult.getValue() != null) {
                        reading.setWaterReading(ocrResult.getValue());
                        log.info("✅ Auto-filled water reading: {} m³", ocrResult.getValue());
                    }
                    break;

                default:
                    throw new IllegalArgumentException("Invalid meter type: " + meterType);
            }

            // 6. Add OCR notes
            String notes = reading.getNotes() != null ? reading.getNotes() + "\n" : "";
            notes += String.format("🇻🇳 OCR: confidence=%.2f%%, strategy=%s, raw=%s",
                    ocrResult.getConfidence() * 100,
                    ocrResult.getStrategy(),
                    ocrResult.getRawText());
            reading.setNotes(notes);

            // 7. Save
            MeterReading updated = meterReadingRepository.save(reading);

            log.info("✅ Meter photo uploaded successfully with Vietnamese OCR");

            return updated;

        } catch (Exception e) {
            log.error("❌ Error uploading meter photo with OCR", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Failed to upload meter photo: " + e.getMessage());
        }
    }

    /**
     * Upload meter photo without OCR (manual entry)
     */
    @Transactional
    public MeterReading uploadMeterPhoto(
            String meterReadingId,
            MultipartFile file,
            String meterType) {

        log.info("Uploading {} meter photo (no OCR) for reading: {}",
                meterType, meterReadingId);

        validateImageFile(file);

        MeterReading reading = getMeterReading(meterReadingId);

        try {
            // Upload photo to file service
            FileResponse fileResponse = fileClient.uploadFile(
                    file,
                    "METER_READING",
                    meterReadingId
            ).getResult();

            String photoUrl = fileResponse.getPublicUrl();

            // Update based on type
            switch (meterType.toUpperCase()) {
                case "ELECTRICITY":
                    reading.setElectricityPhotoUrl(photoUrl);
                    break;
                case "WATER":
                    reading.setWaterPhotoUrl(photoUrl);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid meter type: " + meterType);
            }

            return meterReadingRepository.save(reading);

        } catch (Exception e) {
            log.error("Error uploading meter photo", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Failed to upload meter photo: " + e.getMessage());
        }
    }

    // ==================== MANUAL READING ====================

    /**
     * Create meter reading manually (without photo)
     */
    @Transactional
    public MeterReading createManualReading(
            String contractId,
            String propertyId,
            LocalDate readingMonth,
            Double electricityReading,
            Double waterReading,
            Double gasReading) {

        log.info("Creating manual meter reading for contract: {}", contractId);

        MeterReading reading = MeterReading.builder()
                .contractId(contractId)
                .propertyId(propertyId)
                .readingMonth(readingMonth)
                .readingDate(LocalDate.now())
                .electricityReading(electricityReading)
                .waterReading(waterReading)
                .recordedBy(getCurrentUserId())
                .createdAt(Instant.now())
                .build();

        return meterReadingRepository.save(reading);
    }

    /**
     * Update meter reading values manually
     */
    @Transactional
    public MeterReading updateReadingValues(
            String meterReadingId,
            Double electricityReading,
            Double waterReading,
            Double gasReading) {

        log.info("Updating meter reading values: {}", meterReadingId);

        MeterReading reading = getMeterReading(meterReadingId);

        if (electricityReading != null) {
            reading.setElectricityReading(electricityReading);
        }
        if (waterReading != null) {
            reading.setWaterReading(waterReading);
        }

        reading.setReadingDate(LocalDate.now());

        return meterReadingRepository.save(reading);
    }

    // ==================== QUERY ====================

    public MeterReading getMeterReading(String id) {
        return meterReadingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "Meter reading not found: " + id));
    }

    public List<MeterReading> getByContract(String contractId) {
        return meterReadingRepository.findByContractIdOrderByReadingMonthDesc(contractId);
    }

    public List<MeterReading> getByProperty(String propertyId) {
        return meterReadingRepository.findByPropertyIdOrderByReadingMonthDesc(propertyId);
    }

    public MeterReading getLatest(String contractId) {
        return meterReadingRepository.findFirstByContractIdOrderByReadingMonthDesc(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                        "No meter readings found for contract: " + contractId));
    }

    // ==================== DELETE ====================

    @Transactional
    public void deletePhoto(String meterReadingId, String photoType) {
        log.info("Deleting {} photo for meter reading: {}", photoType, meterReadingId);

        MeterReading reading = getMeterReading(meterReadingId);

        switch (photoType.toUpperCase()) {
            case "ELECTRICITY":
                reading.setElectricityPhotoUrl(null);
                break;
            case "WATER":
                reading.setWaterPhotoUrl(null);
                break;
            default:
                throw new IllegalArgumentException("Invalid photo type: " + photoType);
        }

        meterReadingRepository.save(reading);
    }

    // ==================== VALIDATION ====================

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "File is empty");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Invalid file type. Allowed: JPEG, PNG, WEBP");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "File size exceeds maximum allowed (10MB)");
        }

        log.debug("File validation passed: {}, size: {}",
                file.getOriginalFilename(), file.getSize());
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }
}