package com.roomie.services.contract_service.service;

import com.roomie.services.contract_service.configuration.InMemoryMultipartFile;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.file.FileResponse;
import com.roomie.services.contract_service.repository.httpclient.FileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PdfFileService {

    FileClient fileClient;
    ContractPdfGenerator pdfGenerator;

    /**
     * Tạo PDF từ HTML, upload lên file-service và trả về URL
     */
    public String generateUploadAndSignUrl(String fileName, String htmlContent, String contractId) {
        try {
            // 1️⃣ Tạo PDF từ HTML với CSS styling
            byte[] pdfBytes = pdfGenerator.generatePdfFromHtml(htmlContent);

            log.info("Generated PDF for contract {} - size: {} bytes", contractId, pdfBytes.length);

            // 2️⃣ Đóng gói thành MultipartFile để gửi qua FeignClient
            MultipartFile multipartFile = new InMemoryMultipartFile(fileName, pdfBytes);

            // 3️⃣ Upload lên file service
            ApiResponse<FileResponse> response = fileClient.uploadFile(
                    multipartFile,
                    "contract",
                    contractId
            );

            // 4️⃣ Xử lý lỗi
            if (response == null || response.getResult() == null) {
                log.error("Contract PDF upload failed for contractId: {}", contractId);
                throw new RuntimeException("Contract PDF upload failed for contractId: " + contractId);
            }

            // 5️⃣ Trả về URL public
            String url = response.getResult().getUrl();
            log.info("Successfully uploaded contract PDF: {} -> {}", contractId, url);
            return url;

        } catch (Exception e) {
            log.error("Error in generateUploadAndSignUrl for contract {}", contractId, e);
            throw new RuntimeException("Failed to generate and upload PDF for contract: " + contractId, e);
        }
    }
}