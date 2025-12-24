package com.roomie.services.notification_service.repository;

import com.roomie.services.notification_service.entity.NotificationTemplate;
import com.roomie.services.notification_service.enums.NotificationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends MongoRepository<NotificationTemplate, String> {
    Optional<NotificationTemplate> findByTypeAndLanguageAndIsActiveTrue(
            NotificationType type,
            String language
    );

    Optional<NotificationTemplate> findByTypeAndLanguage(
            NotificationType type,
            String language
    );
}