package com.roomie.services.file_service.configuration;

import com.roomie.services.file_service.entity.FileMgmt;
import com.roomie.services.file_service.repository.FileMgmtRepository;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileCleanupTask {
    FileMgmtRepository fileMgmtRepository;
    MinioClient minioClient;
    String bucketName = "roomie-files";

    // Chạy mỗi ngày lúc 2:00 sáng
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupDeletedFiles() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);

        List<FileMgmt> oldDeletedFiles = fileMgmtRepository
                .findByDeletedTrueAndDeletedAtBefore(threshold);

        for (FileMgmt file : oldDeletedFiles) {
            try {
                minioClient.removeObject(RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(file.getPath())
                        .build());

                fileMgmtRepository.delete(file);
                log.info("Deleted file from MinIO and DB: {}", file.getFileId());
            } catch (Exception e) {
                log.error("Failed to delete file {} from MinIO", file.getFileId(), e);
            }
        }
    }
}
