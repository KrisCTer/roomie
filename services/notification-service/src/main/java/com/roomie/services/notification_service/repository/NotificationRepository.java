package com.roomie.services.notification_service.repository;

import com.roomie.services.notification_service.entity.Notification;
import com.roomie.services.notification_service.enums.NotificationPriority;
import com.roomie.services.notification_service.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Lấy notifications của user
    Page<Notification> findByUserId(String userId, Pageable pageable);

    // Lấy notifications chưa đọc
    Page<Notification> findByUserIdAndIsReadFalse(String userId, Pageable pageable);
    List<Notification> findByUserIdAndIsReadFalse(String userId);

    // Đếm số notifications chưa đọc
    long countByUserIdAndIsReadFalse(String userId);

    // Lấy theo type
    Page<Notification> findByUserIdAndType(String userId, NotificationType type, Pageable pageable);

    // Lấy theo priority
    Page<Notification> findByUserIdAndPriority(String userId, NotificationPriority priority, Pageable pageable);

    // Lấy theo khoảng thời gian
    Page<Notification> findByUserIdAndCreatedAtBetween(
            String userId,
            Instant from,
            Instant to,
            Pageable pageable
    );

    // Lấy theo entity
    List<Notification> findByRelatedEntityIdAndRelatedEntityType(
            String entityId,
            String entityType
    );

    // Xóa notifications đã hết hạn
    void deleteByExpiresAtBefore(Instant now);

    // Tìm notifications chưa gửi email
    @Query("{ 'channel': { $in: ['EMAIL', 'ALL'] }, 'emailSent': { $ne: true } }")
    List<Notification> findUnsentEmails();

    // Statistics queries
    @Query(value = "{ 'userId': ?0, 'createdAt': { $gte: ?1 } }", count = true)
    long countByUserIdAndCreatedAtAfter(String userId, Instant from);

    @Query("{ 'userId': ?0, 'type': ?1 }")
    long countByUserIdAndType(String userId, NotificationType type);
}