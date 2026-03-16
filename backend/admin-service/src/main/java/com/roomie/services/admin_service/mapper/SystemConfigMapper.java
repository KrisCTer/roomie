package com.roomie.services.admin_service.mapper;

import com.roomie.services.admin_service.dto.request.SystemConfigRequest;
import com.roomie.services.admin_service.dto.response.SystemConfigResponse;
import com.roomie.services.admin_service.entity.SystemConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SystemConfigMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.Instant.now())")
    void updateEntity(@MappingTarget SystemConfig entity, SystemConfigRequest request);
    SystemConfigResponse toResponse(SystemConfig entity);
}
