package com.roomie.services.notification_service.mapper;

import com.roomie.services.notification_service.dto.response.NotificationResponse;
import com.roomie.services.notification_service.entity.Notification;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class NotificationMapperManual implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification entity) {
        if (entity == null) {
            return null;
        }

        NotificationResponse response = new NotificationResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUserId());
        response.setTitle(entity.getTitle());
        response.setMessage(entity.getMessage());
        response.setShortMessage(entity.getShortMessage());
        response.setType(entity.getType());
        response.setPriority(entity.getPriority());
        response.setChannel(entity.getChannel());
        response.setRelatedEntityId(entity.getRelatedEntityId());
        response.setRelatedEntityType(entity.getRelatedEntityType());
        response.setIsRead(entity.getIsRead());
        response.setActionUrl(entity.getActionUrl());
        response.setActionText(entity.getActionText());
        response.setMetadata(entity.getMetadata());
        response.setData(entity.getData());
        response.setImageUrl(entity.getImageUrl());
        response.setIconUrl(entity.getIconUrl());
        response.setCreatedAt(entity.getCreatedAt());
        response.setReadAt(entity.getReadAt());
        response.setExpiresAt(entity.getExpiresAt());
        return response;
    }
}
