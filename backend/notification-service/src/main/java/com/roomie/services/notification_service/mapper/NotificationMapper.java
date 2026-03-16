package com.roomie.services.notification_service.mapper;

import com.roomie.services.notification_service.dto.response.NotificationResponse;
import com.roomie.services.notification_service.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification entity);
}