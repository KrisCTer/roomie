package com.roomie.services.billing_service.service;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Vietnamese Meter OCR Service
 * Chuyên đọc đồng hồ điện/nước Việt Nam
 *
 * Supported meters:
 * - CÔNG TY ĐIỆN 1 PHA 2 DÂY
 * - EMIC, CHINT, etc.
 * - Analog and digital displays
 *
 * Example: Ảnh đồng hồ bạn upload có chỉ số "000007" kWh
 */
@Service
@Slf4j
public class VietnameseMeterOcrService {

    @Value("${ocr.tesseract.datapath:/usr/share/tesseract-ocr/4.00/tessdata}")
    private String tesseractDataPath;

    /**
     * Đọc chỉ số từ đồng hồ điện Việt Nam
     * Ví dụ: Ảnh của bạn có chỉ số "000007" kWh
     */
    public MeterReadingResult readVietnameseMeter(MultipartFile imageFile) {
        log.info("🇻🇳 Reading Vietnamese meter from: {}", imageFile.getOriginalFilename());

        try {
            // 1. Load image
            BufferedImage originalImage = ImageIO.read(imageFile.getInputStream());
            if (originalImage == null) {
                throw new IOException("Cannot load image");
            }

            // 2. Detect meter type from image
            MeterType meterType = detectMeterType(originalImage);
            log.info("Detected meter type: {}", meterType);

            // 3. Extract meter display region
            BufferedImage displayRegion = extractDisplayRegion(originalImage, meterType);

            // 4. Preprocess for Vietnamese meters
            BufferedImage processed = preprocessVietnameseMeter(displayRegion, meterType);

            // 5. Multiple OCR strategies
            List<MeterReadingResult> results = new ArrayList<>();

            // Strategy 1: Direct number reading
            results.add(readDirectNumbers(processed));

            // Strategy 2: Full text extraction
            results.add(readFullText(processed));

            // Strategy 3: Rotating image (sometimes helps)
            results.add(readWithRotation(processed));

            // 6. Select best result
            MeterReadingResult best = selectBestResult(results);

            log.info("✅ Best reading: value={}, confidence={}",
                    best.getValue(), best.getConfidence());

            return best;

        } catch (Exception e) {
            log.error("Error reading Vietnamese meter", e);
            return MeterReadingResult.error("Lỗi đọc đồng hồ: " + e.getMessage());
        }
    }

    /**
     * Phát hiện loại đồng hồ
     */
    private MeterType detectMeterType(BufferedImage image) {
        // Simple detection based on common text
        String quickScan = quickTextScan(image);

        if (quickScan.contains("CÔNG TY ĐIỆN") || quickScan.contains("EMIC")) {
            return MeterType.ELECTRIC_ANALOG;
        } else if (quickScan.contains("LCD") || quickScan.contains("DIGITAL")) {
            return MeterType.ELECTRIC_DIGITAL;
        } else if (quickScan.contains("NƯỚC") || quickScan.contains("WATER")) {
            return MeterType.WATER_ANALOG;
        }

        return MeterType.ELECTRIC_ANALOG; // Default
    }

    /**
     * Quick text scan để detect meter type
     */
    private String quickTextScan(BufferedImage image) {
        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(tesseractDataPath);
            tesseract.setLanguage("vie"); // Vietnamese

            return tesseract.doOCR(image);
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Trích xuất vùng hiển thị chỉ số
     * Đồng hồ điện thường có chỉ số ở giữa trên
     */
    private BufferedImage extractDisplayRegion(BufferedImage image, MeterType type) {
        int width = image.getWidth();
        int height = image.getHeight();

        // For electric meters: Top-center region
        // Ví dụ: "000007 kWh" thường ở 1/3 phía trên
        int x = width / 4;
        int y = height / 6;
        int w = width / 2;
        int h = height / 3;

        try {
            return image.getSubimage(x, y, w, h);
        } catch (Exception e) {
            log.warn("Cannot extract region, using full image");
            return image;
        }
    }

    /**
     * Tiền xử lý cho đồng hồ Việt Nam
     */
    private BufferedImage preprocessVietnameseMeter(BufferedImage image, MeterType type) {
        BufferedImage processed = image;

        // 1. Resize if too large
        if (processed.getWidth() > 1920) {
            processed = Scalr.resize(processed, Scalr.Method.QUALITY, 1920);
        }

        // 2. For analog meters with black digits on white background
        if (type == MeterType.ELECTRIC_ANALOG) {
            processed = convertToGrayscale(processed);
            processed = increaseContrast(processed, 2.0f); // Higher contrast
            processed = binarize(processed, 128); // Black & white
        }

        // 3. Denoise
        processed = denoise(processed);

        return processed;
    }

    /**
     * Strategy 1: Đọc trực tiếp số
     */
    private MeterReadingResult readDirectNumbers(BufferedImage image) {
        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(tesseractDataPath);
            tesseract.setLanguage("eng");
            tesseract.setPageSegMode(7); // Single line
            tesseract.setOcrEngineMode(1); // LSTM

            // Only accept digits
            tesseract.setTessVariable("tessedit_char_whitelist", "0123456789.");

            String text = tesseract.doOCR(image).trim();

            return parseVietnameseMeterReading(text, "DirectNumbers");

        } catch (TesseractException e) {
            log.error("Strategy 1 failed", e);
            return MeterReadingResult.error("Strategy 1 failed");
        }
    }

    /**
     * Strategy 2: Đọc full text (bao gồm "kWh", "m³")
     */
    private MeterReadingResult readFullText(BufferedImage image) {
        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(tesseractDataPath);
            tesseract.setLanguage("eng+vie"); // Both languages
            tesseract.setPageSegMode(6); // Single block

            String text = tesseract.doOCR(image).trim();

            return parseVietnameseMeterReading(text, "FullText");

        } catch (TesseractException e) {
            log.error("Strategy 2 failed", e);
            return MeterReadingResult.error("Strategy 2 failed");
        }
    }

    /**
     * Strategy 3: Thử xoay ảnh (0°, 90°, 180°, 270°)
     */
    private MeterReadingResult readWithRotation(BufferedImage image) {
        List<MeterReadingResult> results = new ArrayList<>();

        // Try different rotations
        int[] angles = {0, 90, 180, 270};

        for (int angle : angles) {
            try {
                BufferedImage rotated = rotateImage(image, angle);
                MeterReadingResult result = readDirectNumbers(rotated);
                if (result.isSuccess()) {
                    results.add(result);
                }
            } catch (Exception e) {
                // Skip this rotation
            }
        }

        return results.isEmpty()
                ? MeterReadingResult.error("No rotation worked")
                : results.get(0);
    }

    /**
     * Parse chỉ số từ text - Chuyên cho đồng hồ VN
     */
    private MeterReadingResult parseVietnameseMeterReading(String text, String strategy) {
        if (text == null || text.isEmpty()) {
            return MeterReadingResult.builder()
                    .success(false)
                    .confidence(0.0)
                    .error("No text extracted")
                    .build();
        }

        log.debug("[{}] Extracted text: {}", strategy, text);

        // Patterns for Vietnamese meters
        List<Pattern> patterns = new ArrayList<>();

        // Pattern 1: Typical format "000007" (5-7 digits)
        patterns.add(Pattern.compile("\\b(\\d{5,7})\\b"));

        // Pattern 2: With decimals "000007.5"
        patterns.add(Pattern.compile("\\b(\\d{5,7}\\.\\d{1,2})\\b"));

        // Pattern 3: With kWh/m3 "000007 kWh" or "000007kWh"
        patterns.add(Pattern.compile("(\\d{5,7}(?:\\.\\d{1,2})?)\\s*(?:kWh|kwh|KWH|m3|m³|M3)?"));

        // Pattern 4: Separated digits "0 0 0 0 0 7"
        patterns.add(Pattern.compile("([0-9]\\s*){5,7}"));

        List<MeterCandidate> candidates = new ArrayList<>();

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            while (matcher.find()) {
                String match = matcher.group(0);

                // Clean up
                String numberStr = match
                        .replaceAll("[^0-9.]", "") // Remove non-digits
                        .replaceAll("\\s+", "");    // Remove spaces

                try {
                    double value = Double.parseDouble(numberStr);

                    // Validate reasonable range
                    if (value >= 0 && value <= 999999) {
                        double confidence = calculateVietnameseConfidence(
                                numberStr, text, strategy);
                        candidates.add(new MeterCandidate(value, confidence, numberStr));
                    }
                } catch (NumberFormatException e) {
                    // Skip
                }
            }
        }

        if (candidates.isEmpty()) {
            return MeterReadingResult.builder()
                    .success(false)
                    .confidence(0.0)
                    .error("Không tìm thấy chỉ số hợp lệ")
                    .rawText(text)
                    .build();
        }

        // Get best candidate
        candidates.sort((a, b) -> Double.compare(b.confidence, a.confidence));
        MeterCandidate best = candidates.get(0);

        return MeterReadingResult.builder()
                .success(true)
                .value(best.value)
                .confidence(best.confidence)
                .rawText(text)
                .extractedNumber(best.rawNumber)
                .strategy(strategy)
                .build();
    }

    /**
     * Tính confidence cho đồng hồ VN
     */
    private double calculateVietnameseConfidence(
            String numberStr, String fullText, String strategy) {

        double confidence = 0.5;

        // Factor 1: Length (5-7 digits typical)
        int length = numberStr.replace(".", "").length();
        if (length >= 5 && length <= 7) {
            confidence += 0.25;
        } else if (length < 5) {
            confidence -= 0.2; // Too short
        }

        // Factor 2: Leading zeros (very common in VN meters)
        if (numberStr.startsWith("000")) {
            confidence += 0.15;
        } else if (numberStr.startsWith("00")) {
            confidence += 0.1;
        }

        // Factor 3: Vietnamese meter keywords
        String lower = fullText.toLowerCase();
        if (lower.contains("kwh") || lower.contains("điện")) {
            confidence += 0.1;
        }
        if (lower.contains("emic") || lower.contains("chint")) {
            confidence += 0.05;
        }

        // Factor 4: Strategy bonus
        if ("DirectNumbers".equals(strategy)) {
            confidence += 0.05; // Direct is usually more accurate
        }

        return Math.min(1.0, Math.max(0.0, confidence));
    }

    /**
     * Select best result from multiple strategies
     */
    private MeterReadingResult selectBestResult(List<MeterReadingResult> results) {
        return results.stream()
                .filter(MeterReadingResult::isSuccess)
                .max((a, b) -> Double.compare(a.getConfidence(), b.getConfidence()))
                .orElse(MeterReadingResult.error("Tất cả strategies đều thất bại"));
    }

    // ==================== IMAGE PROCESSING ====================

    private BufferedImage convertToGrayscale(BufferedImage image) {
        BufferedImage gray = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(image, 0, 0, null);
        g.dispose();
        return gray;
    }

    private BufferedImage increaseContrast(BufferedImage image, float factor) {
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                r = clamp((int)(128 + factor * (r - 128)));
                g = clamp((int)(128 + factor * (g - 128)));
                b = clamp((int)(128 + factor * (b - 128)));

                image.setRGB(x, y, (r << 16) | (g << 8) | b);
            }
        }
        return image;
    }

    /**
     * Binarize image (chuyển thành đen-trắng thuần)
     * Helps với đồng hồ analog
     */
    private BufferedImage binarize(BufferedImage image, int threshold) {
        BufferedImage binary = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_BINARY);

        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int rgb = image.getRGB(x, y);
                int gray = (rgb >> 16) & 0xFF;

                int newColor = gray > threshold ? 255 : 0;
                int newRgb = (newColor << 16) | (newColor << 8) | newColor;
                binary.setRGB(x, y, newRgb);
            }
        }
        return binary;
    }

    private BufferedImage denoise(BufferedImage image) {
        return Scalr.apply(image, Scalr.OP_ANTIALIAS);
    }

    private BufferedImage rotateImage(BufferedImage image, int angle) {
        int width = image.getWidth();
        int height = image.getHeight();

        BufferedImage rotated = new BufferedImage(height, width, image.getType());
        Graphics2D g = rotated.createGraphics();

        g.rotate(Math.toRadians(angle), height / 2.0, width / 2.0);
        g.drawImage(image, 0, 0, null);
        g.dispose();

        return rotated;
    }

    private int clamp(int value) {
        return Math.min(255, Math.max(0, value));
    }

    // ==================== ENUMS & CLASSES ====================

    enum MeterType {
        ELECTRIC_ANALOG,    // Đồng hồ điện cơ (như ảnh bạn upload)
        ELECTRIC_DIGITAL,   // Đồng hồ điện tử
        WATER_ANALOG,       // Đồng hồ nước cơ
        WATER_DIGITAL,      // Đồng hồ nước điện tử
        GAS_ANALOG          // Đồng hồ gas
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MeterReadingResult {
        private boolean success;
        private Double value;
        private double confidence;
        private String rawText;
        private String extractedNumber;
        private String strategy;
        private String error;

        public static MeterReadingResult error(String message) {
            return MeterReadingResult.builder()
                    .success(false)
                    .confidence(0.0)
                    .error(message)
                    .build();
        }
    }

    private static class MeterCandidate {
        double value;
        double confidence;
        String rawNumber;

        MeterCandidate(double value, double confidence, String rawNumber) {
            this.value = value;
            this.confidence = confidence;
            this.rawNumber = rawNumber;
        }
    }
}