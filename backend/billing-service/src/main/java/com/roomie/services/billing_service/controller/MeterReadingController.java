package com.roomie.services.billing_service.controller;

import org.springframework.http.ResponseEntity;
import com.roomie.services.billing_service.dto.response.ApiResponse;
import com.roomie.services.billing_service.dto.response.MeterReadingResult;
import com.roomie.services.billing_service.entity.MeterReading;
import com.roomie.services.billing_service.repository.MeterReadingRepository;
import com.roomie.services.billing_service.service.MeterOcrService;
import com.roomie.services.billing_service.service.MeterReadingService;
import com.roomie.services.billing_service.service.VietnameseMeterOcrService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/meter-reading")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MeterReadingController {

    MeterReadingRepository meterReadingRepository;
    MeterReadingService meterReadingService;
    MeterOcrService ocrService;
    VietnameseMeterOcrService vietnameseOcrService;

    @GetMapping("/{id}")
    public ApiResponse<MeterReading> getOne(@PathVariable String id) {
        log.debug("Fetching meter reading: {}", id);

        MeterReading reading = meterReadingService.getMeterReading(id);
        return ApiResponse.success(reading,
                "Meter reading retrieved successfully");
    }

    @GetMapping("/contract/{contractId}")
    public ApiResponse<List<MeterReading>> getByContract(
            @PathVariable String contractId) {

        log.debug("Fetching meter readings for contract: {}", contractId);

        List<MeterReading> readings = meterReadingService.getByContract(contractId);
        return ApiResponse.success(readings,
                String.format("Found %d meter reading(s)", readings.size()));
    }

    @GetMapping("/property/{propertyId}")
    public ApiResponse<List<MeterReading>> getByProperty(
            @PathVariable String propertyId) {

        log.debug("Fetching meter readings for property: {}", propertyId);

        List<MeterReading> readings = meterReadingService.getByProperty(propertyId);
        return ApiResponse.success(readings,
                String.format("Found %d meter reading(s)", readings.size()));
    }

    @GetMapping("/contract/{contractId}/latest")
    public ApiResponse<MeterReading> getLatest(
            @PathVariable String contractId) {

        log.debug("Fetching latest meter reading for contract: {}", contractId);

        MeterReading reading = meterReadingService.getLatest(contractId);
        return ApiResponse.success(reading,
                "Latest meter reading retrieved successfully");
    }

    @PostMapping(value = "/{id}/upload-with-ai",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<MeterReading> uploadWithAi(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("meterType") String meterType) {

        log.info("🤖 AI Upload: {} meter photo for reading: {}", meterType, id);

        MeterReading updated = meterReadingService.uploadMeterPhotoWithOcr(
                id, file, meterType);

        String message = String.format(
                "Photo uploaded and reading extracted by AI. " +
                        "Meter value: %s %s. Check 'notes' field for OCR confidence",
                updated.getElectricityReading() != null ? updated.getElectricityReading() :
                        updated.getWaterReading() != null ? updated.getWaterReading() : "N/A",
                "ELECTRICITY".equals(meterType) ? "kWh" : "m³"
        );

        return ApiResponse.success(updated, message);
    }

    @PostMapping(value = "/test-ocr",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MeterReadingResult> testOcr(
            @RequestParam("file") MultipartFile file) {

        log.info("🧪 Testing generic OCR on photo: {}", file.getOriginalFilename());

        MeterReadingResult result = ocrService.readMeterFromImage(file);

        String message = result.isSuccess()
                ? String.format("AI đọc được: %.1f (độ tin cậy: %.0f%%)",
                result.getValue(), result.getConfidence() * 100)
                : "AI không đọc được chỉ số: " + result.getError();

        return ApiResponse.success(result, message);
    }

    @PostMapping(value = "/test-vietnamese-ocr",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<VietnameseMeterOcrService.MeterReadingResult> testVietnameseOcr(
            @RequestParam("file") MultipartFile file) {

        log.info("🇻🇳 Testing VIETNAMESE OCR on photo: {}", file.getOriginalFilename());

        VietnameseMeterOcrService.MeterReadingResult result =
                vietnameseOcrService.readVietnameseMeter(file);

        String message = result.isSuccess()
                ? String.format("🇻🇳 AI đọc được: %.1f kWh (độ tin cậy: %.0f%%, strategy: %s)",
                result.getValue(),
                result.getConfidence() * 100,
                result.getStrategy())
                : "🇻🇳 AI không đọc được chỉ số: " + result.getError();

        return ApiResponse.success(result, message);
    }

    @PostMapping(value = "/{id}/electricity-photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MeterReading> uploadElectricityPhoto(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading electricity photo (no OCR) for reading: {}", id);

        MeterReading updated = meterReadingService.uploadMeterPhoto(
                id, file, "ELECTRICITY");

        return ApiResponse.success(updated,
                "Electricity photo uploaded. Please enter reading value manually");
    }

    @PostMapping(value = "/{id}/water-photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MeterReading> uploadWaterPhoto(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading water photo (no OCR) for reading: {}", id);

        MeterReading updated = meterReadingService.uploadMeterPhoto(
                id, file, "WATER");

        return ApiResponse.success(updated,
                "Water photo uploaded. Please enter reading value manually");
    }

    @PostMapping("/manual")
    public ApiResponse<MeterReading> createManual(
            @RequestParam String contractId,
            @RequestParam String propertyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate readingMonth,
            @RequestParam(required = false) Double electricityReading,
            @RequestParam(required = false) Double waterReading,
            @RequestParam(required = false) Double gasReading) {

        log.info("Creating manual meter reading for contract: {}, month: {}",
                contractId, readingMonth);

        MeterReading reading = meterReadingService.createManualReading(
                contractId, propertyId, readingMonth,
                electricityReading, waterReading, gasReading);

        return ApiResponse.success(reading,
                "Manual meter reading created successfully");
    }

    @PutMapping("/{id}/values")
    public ApiResponse<MeterReading> updateValues(
            @PathVariable String id,
            @RequestParam(required = false) Double electricityReading,
            @RequestParam(required = false) Double waterReading,
            @RequestParam(required = false) Double gasReading) {

        log.info("Updating meter reading values: {}", id);

        MeterReading updated = meterReadingService.updateReadingValues(
                id, electricityReading, waterReading, gasReading);

        return ApiResponse.success(updated,
                "Meter reading values updated successfully");
    }

    @DeleteMapping("/{id}/photo")
    public ApiResponse<Void> deletePhoto(
            @PathVariable String id,
            @RequestParam String photoType) {

        log.info("Deleting {} photo for meter reading: {}", photoType, id);

        meterReadingService.deletePhoto(id, photoType);

        return ApiResponse.success(null,
                "Photo deleted successfully");
    }

    @GetMapping("/contract/{contractId}/stats")
    public ApiResponse<Object> getConsumptionStats(
            @PathVariable String contractId) {

        log.debug("Calculating consumption statistics for contract: {}", contractId);

        return ApiResponse.success(null,
                "Statistics feature coming soon");
    }

    @GetMapping("/contract/{contractId}/chart")
    public ApiResponse<Object> getChartData(
            @PathVariable String contractId,
            @RequestParam(defaultValue = "12") int months) {

        log.debug("Fetching chart data for contract: {} ({} months)",
                contractId, months);

        return ApiResponse.success(null,
                "Chart data feature coming soon");
    }

    @GetMapping("/contract/{contractId}/compare")
    public ApiResponse<Object> compareConsumption(
            @PathVariable String contractId,
            @RequestParam String period1,
            @RequestParam String period2) {

        log.debug("Comparing consumption for periods: {} vs {}", period1, period2);

        return ApiResponse.success(null,
                "Comparison feature coming soon");
    }

    @GetMapping("/contract/{contractId}/anomalies")
    public ApiResponse<Object> detectAnomalies(
            @PathVariable String contractId) {

        log.debug("Detecting consumption anomalies for contract: {}", contractId);

        return ApiResponse.success(null,
                "Anomaly detection feature coming soon");
    }

    @GetMapping("/contract/{contractId}/export")
    public ResponseEntity<Object> export(
            @PathVariable String contractId,
            @RequestParam(defaultValue = "csv") String format) {

        log.info("Exporting meter readings for contract: {} to {}",
                contractId, format);

        throw new UnsupportedOperationException("Export feature coming soon");
    }
}