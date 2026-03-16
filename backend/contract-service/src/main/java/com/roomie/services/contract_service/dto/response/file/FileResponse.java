package com.roomie.services.contract_service.dto.response.file;

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
