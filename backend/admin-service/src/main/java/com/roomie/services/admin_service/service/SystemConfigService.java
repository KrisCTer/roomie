package com.roomie.services.admin_service.service;

import com.roomie.services.admin_service.dto.request.SystemConfigRequest;
import com.roomie.services.admin_service.entity.SystemConfig;
import com.roomie.services.admin_service.mapper.SystemConfigMapper;
import com.roomie.services.admin_service.repository.SystemConfigRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SystemConfigService {
    SystemConfigRepository repository;
    SystemConfigMapper mapper;
    RedisTemplate<String, Object> redis;
    static String CACHE_KEY = "system:config";

    public SystemConfig getConfig() {
        SystemConfig cached = (SystemConfig) redis.opsForValue().get(CACHE_KEY);
        if (cached != null) return cached;

        SystemConfig config = repository.findFirstByOrderByUpdatedAtDesc()
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setUpdatedAt(Instant.now());
                    return repository.save(c);
                });

        redis.opsForValue().set(CACHE_KEY, config, 30, TimeUnit.MINUTES);

        return config;
    }

    public SystemConfig updateConfig(SystemConfigRequest request) {
        SystemConfig config = getConfig();
        mapper.updateEntity(config, request);
        SystemConfig saved = repository.save(config);

        redis.delete(CACHE_KEY); // xoá cache khi update

        return saved;
    }
}
