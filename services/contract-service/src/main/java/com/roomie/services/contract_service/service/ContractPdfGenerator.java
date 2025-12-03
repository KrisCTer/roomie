package com.roomie.services.contract_service.service;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.roomie.services.contract_service.exception.AppException;
import com.roomie.services.contract_service.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ContractPdfGenerator {

    /**
     * Tạo PDF từ HTML với CSS styling
     * Hỗ trợ tiếng Việt và font chữ đẹp
     */
    public byte[] generatePdfFromHtml(String htmlContent) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ConverterProperties props = new ConverterProperties();

            // Có thể thêm font tiếng Việt nếu cần
            // FontProvider fontProvider = new DefaultFontProvider();
            // props.setFontProvider(fontProvider);

            HtmlConverter.convertToPdf(htmlContent, baos, props);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF from HTML", e);
            throw new AppException(ErrorCode.FAILED_TO_GEN_PDF,e.getMessage());
        }
    }

    /**
     * Legacy method - deprecated
     */
    @Deprecated
    public byte[] generatePdfBytes(String htmlText, String title) {
        return generatePdfFromHtml(
                "<html><body><h1>" + title + "</h1><p>" + htmlText + "</p></body></html>"
        );
    }
}