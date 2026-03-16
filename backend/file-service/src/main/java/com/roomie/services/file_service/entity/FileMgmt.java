package com.roomie.services.file_service.entity;

import com.roomie.services.file_service.enums.FileType;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "file_mgmt")
public class FileMgmt {
    @MongoId
    String id;

    String fileId;
    String ownerId;
    String fileName;
    FileType fileType;
    String entityType;
    String entityId;
    String contentType;
    long size;
    String md5Checksum;
    String path;
    String publicUrl;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime deletedAt;

    boolean deleted = false;
}