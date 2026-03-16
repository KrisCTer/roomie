package com.roomie.services.contract_service.repository.httpclient;

import com.roomie.services.contract_service.configuration.AuthenticationRequestInterceptor;
import com.roomie.services.contract_service.configuration.FeignMultipartConfig;
import com.roomie.services.contract_service.dto.response.ApiResponse;
import com.roomie.services.contract_service.dto.response.file.FileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(
        name = "file-service",
        url = "${app.services.files}",
        configuration = {FeignMultipartConfig.class, AuthenticationRequestInterceptor.class}
)
public interface FileClient {
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileResponse> uploadFile(
            @RequestPart("file") MultipartFile file, // <-- dùng @RequestPart
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId
    );
}