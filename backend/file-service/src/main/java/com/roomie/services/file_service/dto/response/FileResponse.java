package com.roomie.services.file_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileResponse {
    String fileId;
    String fileName;
    String fileType;
    String publicUrl;
    String entityType;
    String entityId;
}
