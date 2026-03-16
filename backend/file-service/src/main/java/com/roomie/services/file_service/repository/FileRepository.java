package com.roomie.services.file_service.repository;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Repository
public class FileRepository {
    @Autowired
    MinioClient minioClient;
    @Value("${app.minio.bucket}")
    String bucketName;

    public FileInfo store(MultipartFile file) throws Exception {
        String objectName = java.util.UUID.randomUUID() + "_" + file.getOriginalFilename();

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        }

        String url = String.format("%s/%s/%s", "http://localhost:9000", bucketName, objectName);
        return new FileInfo(file.getOriginalFilename(),
                            objectName,
                            file.getContentType(),
                            file.getSize(),
                            url,
                            DigestUtils.md5DigestAsHex(file.getInputStream())
                            );
    }

    public InputStream read(String objectName) throws Exception {
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build()
        );
    }

    public record FileInfo(String originalName, String path, String contentType, long size, String url,String md5Checksum) {
    }
}