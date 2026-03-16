package com.roomie.services.file_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.InputStream;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileData {
    String contentType;
    InputStream resource;
}
