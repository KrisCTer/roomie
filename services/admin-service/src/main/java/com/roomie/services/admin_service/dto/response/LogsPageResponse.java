package com.roomie.services.admin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LogsPageResponse {
    long total;                 // tổng số logs
    int page;                    // số trang hiện tại
    int size;                    // số bản ghi/trang
    List<LogsResponse> logs;
}
