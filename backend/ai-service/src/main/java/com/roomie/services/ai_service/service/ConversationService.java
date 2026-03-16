package com.roomie.services.ai_service.service;

import com.roomie.services.ai_service.dto.response.ConversationResponse;
import com.roomie.services.ai_service.entity.Conversation;
import com.roomie.services.ai_service.entity.Message;
import com.roomie.services.ai_service.exception.AppException;
import com.roomie.services.ai_service.exception.ErrorCode;
import com.roomie.services.ai_service.repository.ConversationRepository;
import com.roomie.services.ai_service.repository.MessageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ConversationService {

    ConversationRepository conversationRepository;
    MessageRepository messageRepository;

    /**
     * Get user's conversations
     */
    public Page<ConversationResponse> getUserConversations(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Conversation> conversations = conversationRepository
                .findByUserIdAndIsActiveTrueOrderByUpdatedAtDesc(userId, pageable);

        return conversations.map(this::toResponse);
    }

    /**
     * Get single conversation
     */
    public ConversationResponse getConversation(String userId, String conversationId) {
        Conversation conversation = conversationRepository
                .findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        return toResponse(conversation);
    }

    /**
     * Delete conversation
     */
    @Transactional
    public void deleteConversation(String userId, String conversationId) {
        Conversation conversation = conversationRepository
                .findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Soft delete
        conversation.setIsActive(false);
        conversationRepository.save(conversation);

        // Or hard delete
        // conversationRepository.delete(conversation);
        // messageRepository.deleteByConversationId(conversationId);
    }

    /**
     * Update conversation title
     */
    public ConversationResponse updateTitle(String userId, String conversationId, String newTitle) {
        Conversation conversation = conversationRepository
                .findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        conversation.setTitle(newTitle);
        conversationRepository.save(conversation);

        return toResponse(conversation);
    }

    /**
     * Convert to response DTO
     */
    private ConversationResponse toResponse(Conversation conversation) {
        // Get last message for preview
        List<Message> messages = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.getId());

        String lastMessage = messages.isEmpty()
                ? ""
                : messages.get(messages.size() - 1).getContent();

        if (lastMessage.length() > 100) {
            lastMessage = lastMessage.substring(0, 97) + "...";
        }

        return ConversationResponse.builder()
                .id(conversation.getId())
                .userId(conversation.getUserId())
                .title(conversation.getTitle())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .messageCount(conversation.getMessageCount())
                .totalTokens(conversation.getTotalTokens())
                .lastMessage(lastMessage)
                .build();
    }
}