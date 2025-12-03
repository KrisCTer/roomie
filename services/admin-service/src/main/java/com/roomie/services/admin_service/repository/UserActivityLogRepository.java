package com.roomie.services.admin_service.repository;

import com.roomie.services.admin_service.entity.UserActionLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends MongoRepository<UserActionLog, String> {
    List<UserActionLog> findByTimestampBetween(Instant from, Instant to);
    List<UserActionLog> findByUserIdAndTimestampBetween(String userId, Instant from, Instant to);
}