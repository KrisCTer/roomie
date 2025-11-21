package com.roomie.services.admin_service.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.JsonData;
import com.roomie.services.admin_service.dto.response.LogsPageResponse;
import com.roomie.services.admin_service.dto.response.LogsResponse;
import com.roomie.services.admin_service.entity.UserActionLog;
import com.roomie.services.admin_service.repository.UserActivityLogRepository;
import io.micrometer.core.instrument.Measurement;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LogAdminService {
    ElasticsearchClient elasticsearchClient;
    UserActivityLogRepository userActivityLogRepository;
    MeterRegistry meterRegistry;

    public LogsPageResponse getAllLogs(int page, int size, Instant from, Instant to, String type, String userId) {

        List<LogsResponse> mergedLogs = new ArrayList<>();

        /*
         * 1) PERFORMANCE logs từ Prometheus (Micrometer)
         */
        if (type == null || "PERFORMANCE".equalsIgnoreCase(type)) {

            Instant now = Instant.now();

            for (Meter meter : meterRegistry.getMeters()) {
                for (Measurement m : meter.measure()) {
                    mergedLogs.add(LogsResponse.builder()
                            .type("PERFORMANCE")
                            .message(meter.getId().getName() + " = " + m.getValue())
                            .source("prometheus")
                            .timestamp(now)
                            .details(Map.of("meter", meter.getId().getName()))
                            .build());
                }
            }
        }

        /*
         * 2) ELASTICSEARCH logs
         */
        if (type == null || (!"PERFORMANCE".equalsIgnoreCase(type))) {
            try {
                SearchResponse<Map> esResp = elasticsearchClient.search(
                        SearchRequest.of(s -> s
                                .index("logs-*")
                                .size(2000)
                                .query(q -> q.bool(b -> b.must(
                                        m -> m.range(r -> r
                                                .field("timestamp")
                                                .gte(JsonData.of(from.toEpochMilli()))
                                                .lte(JsonData.of(to.toEpochMilli()))
                                        )
                                )))
                        ),
                        Map.class
                );

                for (Hit<Map> hit : esResp.hits().hits()) {

                    Map src = hit.source();

                    Instant ts = convertToInstant(src.get("timestamp"));    // <--- FIX

                    LogsResponse a = LogsResponse.builder()
                            .type((String) src.getOrDefault("type", "UNKNOWN"))
                            .message(String.valueOf(src.getOrDefault("message", "")))
                            .source("elasticsearch")
                            .timestamp(ts)
                            .userId(src.get("userId") != null ? src.get("userId").toString() : null)
                            .details(src)
                            .build();

                    mergedLogs.add(a);
                }

            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }

        /*
         * 3) MongoDB: User activity logs
         */
        List<UserActionLog> mongoLogs;

        if (userId != null) {
            mongoLogs = userActivityLogRepository.findByUserIdAndTimestampBetween(userId, from, to);
        } else {
            mongoLogs = userActivityLogRepository.findByTimestampBetween(from, to);
        }

        for (UserActionLog e : mongoLogs) {
            mergedLogs.add(LogsResponse.builder()
                    .type("USER_ACTIVITY")
                    .message(e.getAction())
                    .source("mongodb")
                    .timestamp(e.getTimestamp())    // <--- FIX: Instant field in entity
                    .userId(e.getUserId())
                    .details(Map.of(
                            "path", e.getPath(),
                            "method", e.getMethod(),
                            "ip", e.getIp()))
                    .build());
        }

        /*
         * Optional type filtering
         */
        if (type != null) {
            mergedLogs = mergedLogs.stream()
                    .filter(l -> type.equalsIgnoreCase(l.getType()))
                    .collect(Collectors.toList());
        }

        /*
         * Sort desc
         */
        mergedLogs.sort(Comparator.comparing(LogsResponse::getTimestamp).reversed());

        /*
         * Pagination
         */
        int fromIndex = Math.min(page * size, mergedLogs.size());
        int toIndex = Math.min(fromIndex + size, mergedLogs.size());

        List<LogsResponse> pageLogs =
                fromIndex >= mergedLogs.size()
                        ? Collections.emptyList()
                        : mergedLogs.subList(fromIndex, toIndex);

        return LogsPageResponse.builder()
                .total(mergedLogs.size())
                .page(page)
                .size(size)
                .logs(pageLogs)
                .build();
    }

    /*
     * Convert any timestamp from ES to Instant
     */
    private Instant convertToInstant(Object val) {
        if (val == null) return Instant.EPOCH;

        if (val instanceof Number) {
            long millis = ((Number) val).longValue();
            return Instant.ofEpochMilli(millis);
        }

        try {
            long millis = Long.parseLong(val.toString());
            return Instant.ofEpochMilli(millis);
        } catch (Exception e) {
            return Instant.EPOCH;
        }
    }
}
