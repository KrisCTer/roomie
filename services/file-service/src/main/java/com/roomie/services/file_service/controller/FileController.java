package com.roomie.services.file_service.controller;

import com.roomie.services.file_service.dto.response.ApiResponse;
import com.roomie.services.file_service.dto.response.FileData;
import com.roomie.services.file_service.dto.response.FileResponse;
import com.roomie.services.file_service.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {

    private final FileService fileService;

    // Upload file
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId
    ) throws Exception {

        FileResponse result = fileService.uploadFile(file, entityType, entityId);
        return ResponseEntity.ok(
                ApiResponse.success(result, "Uploaded successfully")
        );
    }

    // Download file (GIỮ NGUYÊN, KHÔNG BỌC ApiResponse)
    @GetMapping("/download/{fileId}")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable String fileId) throws Exception {
        FileData fileData = fileService.download(fileId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileId + "\"")
                .contentType(MediaType.parseMediaType(fileData.getContentType()))
                .body(new InputStreamResource(fileData.getResource()));
    }

    // List files by entity
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<FileResponse>>> listFilesByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        List<FileResponse> result = fileService.listFilesByEntity(entityType, entityId);
        return ResponseEntity.ok(
                ApiResponse.success(result, "Fetched files by entity successfully")
        );
    }

    // List files by owner
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<FileResponse>>> listFilesByOwner(@PathVariable String ownerId) {
        List<FileResponse> result = fileService.listFilesByOwner(ownerId);
        return ResponseEntity.ok(
                ApiResponse.success(result, "Fetched files by owner successfully")
        );
    }

    // Soft delete file
    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String fileId) throws Exception {
        fileService.deleteFile(fileId);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Deleted file successfully")
        );
    }
}