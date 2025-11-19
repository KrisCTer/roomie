package com.roomie.services.admin_service.service;

import com.roomie.services.admin_service.dto.request.SystemConfigRequest;
import com.roomie.services.admin_service.entity.SystemConfig;
import com.roomie.services.admin_service.mapper.SystemConfigMapper;
import com.roomie.services.admin_service.repository.SystemConfigRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SystemConfigService {
    SystemConfigRepository repository;
    SystemConfigMapper mapper;

    public SystemConfig getConfig() {
        return repository.findFirstByOrderByUpdatedAtDesc()
                .orElseGet(() -> {
                    SystemConfig config = new SystemConfig();
                    config.setUpdatedAt(Instant.now());
                    return repository.save(config);
                });
    }

    public SystemConfig updateConfig(SystemConfigRequest request) {
        SystemConfig config = getConfig();
        mapper.updateEntity(config, request);
        return repository.save(config);
    }
}
