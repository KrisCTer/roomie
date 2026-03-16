package com.roomie.services.identity_service.mapper;

import com.roomie.services.identity_service.dto.request.PermissionRequest;
import com.roomie.services.identity_service.dto.response.PermissionResponse;
import com.roomie.services.identity_service.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}