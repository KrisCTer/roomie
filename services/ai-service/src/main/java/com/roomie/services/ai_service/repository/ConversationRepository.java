package com.roomie.services.ai_service.repository;

import com.roomie.services.ai_service.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    Page<Conversation> findByUserIdAndIsActiveTrueOrderByUpdatedAtDesc(
            String userId, Pageable pageable);

    Optional<Conversation> findByIdAndUserId(String id, String userId);

    List<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId);
}