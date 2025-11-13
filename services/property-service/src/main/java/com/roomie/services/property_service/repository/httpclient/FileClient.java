package com.roomie.services.property_service.repository.httpclient;

import com.roomie.services.property_service.dto.response.ApiResponse;
import com.roomie.services.property_service.dto.response.FileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "file-service", url = "${app.services.files}")
public interface FileClient {
    @PostMapping("/upload")
    ApiResponse<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") Long entityId
    );
}
