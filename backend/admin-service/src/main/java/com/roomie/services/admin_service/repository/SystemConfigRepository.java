package com.roomie.services.admin_service.repository;

import com.roomie.services.admin_service.entity.SystemConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends MongoRepository<SystemConfig, String> {
    Optional<SystemConfig> findFirstByOrderByUpdatedAtDesc();
}
