package com.roomie.services.billing_service.service;

import com.roomie.services.billing_service.dto.response.MeterCandidate;
import com.roomie.services.billing_service.dto.response.MeterReadingResult;
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
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Meter OCR Service
 * Đọc chỉ số điện/nước từ ảnh đồng hồ
 * <p>
 * Features:
 * - Tesseract OCR integration
 * - Image preprocessing (grayscale, contrast, denoise)
 * - Number extraction from meter display
 * - Validation and confidence scoring
 * - Google Cloud Vision API (backup method)
 */
@Service
@Slf4j
public class MeterOcrService {

    @Value("${ocr.tesseract.datapath:/usr/share/tesseract-ocr/4.00/tessdata}")
    private String tesseractDataPath;

    @Value("${ocr.confidence-threshold:0.7}")
    private double confidenceThreshold;

    /**
     * Đọc chỉ số điện/nước từ ảnh
     *
     * @param imageFile Ảnh đồng hồ
     * @return MeterReadingResult với chỉ số và độ tin cậy
     */
    public MeterReadingResult readMeterFromImage(MultipartFile imageFile) {
        log.info("Processing meter image: {}", imageFile.getOriginalFilename());

        try {
            // 1. Load image
            BufferedImage originalImage = ImageIO.read(imageFile.getInputStream());
            if (originalImage == null) {
                throw new IOException("Failed to load image");
            }

            // 2. Preprocess image
            BufferedImage processedImage = preprocessImage(originalImage);

            // 3. Extract text using Tesseract
            String extractedText = extractTextWithTesseract(processedImage);
            log.debug("Extracted text: {}", extractedText);

            // 4. Parse meter reading
            MeterReadingResult result = parseMeterReading(extractedText);

            // 5. If confidence is low, try Google Vision API
            if (result.getConfidence() < confidenceThreshold) {
                log.info("Low confidence, trying Google Vision API");
                MeterReadingResult googleResult = extractTextWithGoogleVision(imageFile);
                if (googleResult.getConfidence() > result.getConfidence()) {
                    result = googleResult;
                }
            }

            log.info("Meter reading result: value={}, confidence={}",
                    result.getValue(), result.getConfidence());

            return result;

        } catch (Exception e) {
            log.error("Error reading meter from image", e);
            return MeterReadingResult.error("Failed to read meter: " + e.getMessage());
        }
    }

    /**
     * Tiền xử lý ảnh để tăng độ chính xác OCR
     */
    private BufferedImage preprocessImage(BufferedImage original) {
        log.debug("Preprocessing image...");

        BufferedImage processed = original;

        // 1. Resize if too large (faster processing)
        if (processed.getWidth() > 1920 || processed.getHeight() > 1080) {
            processed = Scalr.resize(processed, Scalr.Method.QUALITY,
                    Scalr.Mode.FIT_TO_WIDTH, 1920);
        }

        // 2. Convert to grayscale
        processed = convertToGrayscale(processed);

        // 3. Increase contrast
        processed = increaseContrast(processed);

        // 4. Denoise
        processed = denoise(processed);

        // 5. Sharpen
        processed = sharpen(processed);

        return processed;
    }

    /**
     * Chuyển ảnh sang grayscale
     */
    private BufferedImage convertToGrayscale(BufferedImage image) {
        BufferedImage gray = new BufferedImage(
                image.getWidth(),
                image.getHeight(),
                BufferedImage.TYPE_BYTE_GRAY
        );

        Graphics2D g = gray.createGraphics();
        g.drawImage(image, 0, 0, null);
        g.dispose();

        return gray;
    }

    /**
     * Tăng contrast
     */
    private BufferedImage increaseContrast(BufferedImage image) {
        float contrastFactor = 1.5f;

        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                r = (int) Math.min(255, Math.max(0, 128 + contrastFactor * (r - 128)));
                g = (int) Math.min(255, Math.max(0, 128 + contrastFactor * (g - 128)));
                b = (int) Math.min(255, Math.max(0, 128 + contrastFactor * (b - 128)));

                image.setRGB(x, y, (r << 16) | (g << 8) | b);
            }
        }

        return image;
    }

    /**
     * Denoise (làm mịn ảnh)
     */
    private BufferedImage denoise(BufferedImage image) {
        // Simple box blur
        int radius = 1;
        return Scalr.apply(image, Scalr.OP_ANTIALIAS);
    }

    /**
     * Sharpen
     */
    private BufferedImage sharpen(BufferedImage image) {
        float[] sharpenKernel = {
                0, -1, 0,
                -1, 5, -1,
                0, -1, 0
        };

        // TODO: Apply convolution kernel
        return image;
    }

    /**
     * Trích xuất text bằng Tesseract OCR
     */
    private String extractTextWithTesseract(BufferedImage image) {
        try {
            Tesseract tesseract = new Tesseract();

            // Configure Tesseract
            tesseract.setDatapath(tesseractDataPath);
            tesseract.setLanguage("eng"); // English for numbers
            tesseract.setPageSegMode(7); // Single text line
            tesseract.setOcrEngineMode(1); // Neural nets LSTM engine

            // Configure for digit recognition
            tesseract.setTessVariable("tessedit_char_whitelist", "0123456789.");

            // Perform OCR
            String result = tesseract.doOCR(image);

            return result != null ? result.trim() : "";

        } catch (TesseractException e) {
            log.error("Tesseract OCR failed", e);
            return "";
        }
    }

    /**
     * Trích xuất text bằng Google Cloud Vision API (backup method)
     */
    private MeterReadingResult extractTextWithGoogleVision(MultipartFile imageFile) {
        try {
            // TODO: Implement Google Cloud Vision API
            // This requires google-cloud-vision dependency and API key

            /*
            ImageAnnotatorClient vision = ImageAnnotatorClient.create();

            ByteString imgBytes = ByteString.readFrom(imageFile.getInputStream());
            Image img = Image.newBuilder().setContent(imgBytes).build();

            Feature feat = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                .addFeatures(feat)
                .setImage(img)
                .build();

            BatchAnnotateImagesResponse response = vision.batchAnnotateImages(
                Collections.singletonList(request));

            List<AnnotateImageResponse> responses = response.getResponsesList();

            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    log.error("Google Vision error: {}", res.getError().getMessage());
                    return MeterReadingResult.error("Vision API error");
                }

                String text = res.getFullTextAnnotation().getText();
                return parseMeterReading(text);
            }
            */

            log.warn("Google Vision API not configured");
            return MeterReadingResult.error("Google Vision not available");

        } catch (Exception e) {
            log.error("Google Vision API failed", e);
            return MeterReadingResult.error("Vision API failed");
        }
    }

    /**
     * Parse chỉ số từ text đã trích xuất
     */
    private MeterReadingResult parseMeterReading(String text) {
        if (text == null || text.isEmpty()) {
            return MeterReadingResult.builder()
                    .success(false)
                    .confidence(0.0)
                    .error("No text extracted")
                    .build();
        }

        // Patterns for meter readings
        List<Pattern> patterns = new ArrayList<>();

        // Pattern 1: Pure numbers (e.g., "000007")
        patterns.add(Pattern.compile("\\b(\\d{4,8})\\b"));

        // Pattern 2: Numbers with decimals (e.g., "000007.5")
        patterns.add(Pattern.compile("\\b(\\d{4,8}\\.\\d{1,2})\\b"));

        // Pattern 3: Numbers with kWh/m3 unit (e.g., "000007 kWh")
        patterns.add(Pattern.compile("\\b(\\d{4,8}(?:\\.\\d{1,2})?)\\s*(?:kWh|kwh|m3|m³)?\\b"));

        List<MeterCandidate> candidates = new ArrayList<>();

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            while (matcher.find()) {
                String numberStr = matcher.group(1);
                try {
                    double value = Double.parseDouble(numberStr);

                    // Validate reasonable range (0 - 999999)
                    if (value >= 0 && value <= 999999) {
                        double confidence = calculateConfidence(numberStr, text);
                        candidates.add(new MeterCandidate(value, confidence, numberStr));
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid numbers
                }
            }
        }

        // Select best candidate
        if (candidates.isEmpty()) {
            return MeterReadingResult.builder()
                    .success(false)
                    .confidence(0.0)
                    .error("No valid meter reading found")
                    .build();
        }

        // Sort by confidence
        candidates.sort((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()));
        MeterCandidate best = candidates.get(0);

        return MeterReadingResult.builder()
                .success(true)
                .value(best.getValue())
                .confidence(best.getConfidence())
                .rawText(text)
                .extractedNumber(best.getRawNumber())
                .build();
    }

    /**
     * Tính độ tin cậy của kết quả
     */
    private double calculateConfidence(String numberStr, String fullText) {
        double confidence = 0.5; // Base confidence

        // Factor 1: Length (meter readings typically 5-7 digits)
        int length = numberStr.replace(".", "").length();
        if (length >= 5 && length <= 7) {
            confidence += 0.2;
        }

        // Factor 2: Leading zeros (common in meter displays)
        if (numberStr.startsWith("0")) {
            confidence += 0.1;
        }

        // Factor 3: Context keywords
        String lowerText = fullText.toLowerCase();
        if (lowerText.contains("kwh") || lowerText.contains("m3") ||
                lowerText.contains("m³") || lowerText.contains("meter")) {
            confidence += 0.2;
        }

        return Math.min(1.0, confidence);
    }
}