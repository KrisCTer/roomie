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
    FileService fileService;

    // Upload file
    @PostMapping("/upload")
    ApiResponse<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId
    ) throws Exception {
        FileResponse result = fileService.uploadFile(file, entityType, entityId);
        return ApiResponse.<FileResponse>builder().result(result).build();
    }

    // Download file
    @GetMapping("/download/{fileId}")
    ResponseEntity<InputStreamResource> downloadFile(@PathVariable String fileId) throws Exception {
        FileData fileData = fileService.download(fileId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileId + "\"")
                .contentType(MediaType.parseMediaType(fileData.getContentType()))
                .body(new InputStreamResource(fileData.getResource()));
    }

    // List files by entity
    @GetMapping("/entity/{entityType}/{entityId}")
    ApiResponse<List<FileResponse>> listFilesByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        List<FileResponse> result = fileService.listFilesByEntity(entityType, entityId);
        return ApiResponse.<List<FileResponse>>builder().result(result).build();
    }

    // List files by owner
    @GetMapping("/owner/{ownerId}")
    ApiResponse<List<FileResponse>> listFilesByOwner(@PathVariable String ownerId) {
        List<FileResponse> result = fileService.listFilesByOwner(ownerId);
        return ApiResponse.<List<FileResponse>>builder().result(result).build();
    }

    // Soft delete file
    @DeleteMapping("/{fileId}")
    ApiResponse<Void> deleteFile(@PathVariable String fileId) throws Exception {
        fileService.deleteFile(fileId);
        return ApiResponse.<Void>builder().result(null).build();
    }
}
