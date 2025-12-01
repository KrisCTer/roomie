package com.roomie.services.file_service.service;

import com.roomie.services.file_service.dto.response.FileData;
import com.roomie.services.file_service.dto.response.FileResponse;
import com.roomie.services.file_service.exception.AppException;
import com.roomie.services.file_service.exception.ErrorCode;
import com.roomie.services.file_service.mapper.FileMgmtMapper;
import com.roomie.services.file_service.repository.FileMgmtRepository;
import com.roomie.services.file_service.repository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {
    FileRepository fileRepository;
    FileMgmtRepository fileMgmtRepository;
    FileMgmtMapper fileMgmtMapper;

    public FileResponse uploadFile(MultipartFile file, String entityType, String entityId) throws Exception {
        var fileInfo = fileRepository.store(file);

        var fileMgmt = fileMgmtMapper.toFileMgmt(fileInfo);

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        fileMgmt.setOwnerId(userId);
        fileMgmt.setEntityType(entityType);
        fileMgmt.setEntityId(entityId);

        fileMgmt.setFileId(UUID.randomUUID().toString());
        fileMgmt.setPublicUrl(fileInfo.url());

        fileMgmt.setCreatedAt(LocalDateTime.now());
        fileMgmt.setUpdatedAt(LocalDateTime.now());

        fileMgmt = fileMgmtRepository.save(fileMgmt);

        return FileResponse.builder()
                .fileId(fileMgmt.getFileId())
                .fileName(fileMgmt.getFileName() != null ? fileMgmt.getFileName() : fileInfo.originalName())
                .fileType(fileMgmt.getContentType())
                .entityType(fileMgmt.getEntityType())
                .entityId(fileMgmt.getEntityId())
                .publicUrl(fileMgmt.getPublicUrl())
                .build();
    }

    public FileData download(String fileId) throws Exception {
        var fileMgmt = fileMgmtRepository.findByFileId(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        InputStream resource = fileRepository.read(fileMgmt.getPath());

        return new FileData(fileMgmt.getContentType(), resource);
    }

    public List<FileResponse> listFilesByEntity(String entityType, Long entityId) {
        return fileMgmtRepository.findByEntityTypeAndEntityIdAndDeletedFalse(entityType, entityId)
                .stream()
                .map(fileMgmtMapper::toFileResponse)
                .toList();
    }

    public List<FileResponse> listFilesByOwner(String ownerId) {
        return fileMgmtRepository.findByOwnerIdAndDeletedFalse(ownerId)
                .stream()
                .map(fileMgmtMapper::toFileResponse)
                .toList();
    }

    public void deleteFile(String fileId) {
        var file = fileMgmtRepository.findByFileId(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        file.setDeleted(true);
        file.setDeletedAt(LocalDateTime.now());
        fileMgmtRepository.save(file);
    }
}
