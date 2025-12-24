package com.roomie.services.ai_service.service;

import com.roomie.services.ai_service.dto.request.ChatRequest;
import com.roomie.services.ai_service.dto.response.ChatResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatService {

    GeminiService geminiService; // ⭐ Changed from ChatModel
    MessageRepository messageRepository;
    ConversationRepository conversationRepository;

    /**
     * Send message and get AI response
     */
    @Transactional
    public ChatResponse chat(String userId, ChatRequest request) {
        try {
            // Get or create conversation
            Conversation conversation = getOrCreateConversation(userId, request.getConversationId());

            // Save user message
            Message userMessage = saveMessage(
                    conversation.getId(),
                    "user",
                    request.getMessage(),
                    null
            );

            // Get conversation history
            List<Message> history = messageRepository
                    .findByConversationIdOrderByCreatedAtAsc(conversation.getId());

            // Build history for Gemini (exclude last message since it's the current one)
            List<Map<String, String>> geminiHistory = history.stream()
                    .limit(Math.max(0, history.size() - 1)) // Exclude last message
                    .skip(Math.max(0, history.size() - 11)) // Keep last 10 messages
                    .map(msg -> {
                        Map<String, String> historyMsg = new HashMap<>();
                        historyMsg.put("role", msg.getRole());
                        historyMsg.put("content", msg.getContent());
                        return historyMsg;
                    })
                    .collect(Collectors.toList());

            // Get AI response using Gemini
            String aiContent = geminiService.generateContent(request.getMessage(), geminiHistory);

            // Estimate token count (rough estimate: 1 token ≈ 4 characters)
            Integer tokenCount = (request.getMessage().length() + aiContent.length()) / 4;

            // Save AI message
            Message aiMessage = saveMessage(
                    conversation.getId(),
                    "assistant",
                    aiContent,
                    tokenCount
            );

            // Update conversation
            updateConversation(conversation, userMessage.getContent(), tokenCount);

            return ChatResponse.builder()
                    .conversationId(conversation.getId())
                    .messageId(aiMessage.getId())
                    .content(aiContent)
                    .role("assistant")
                    .timestamp(aiMessage.getCreatedAt())
                    .tokenCount(tokenCount)
                    .model("gemini-1.5-flash")
                    .build();

        } catch (Exception e) {
            log.error("Error processing chat request", e);
            throw new AppException(ErrorCode.AI_SERVICE_ERROR);
        }
    }

    /**
     * Get or create conversation
     */
    private Conversation getOrCreateConversation(String userId, String conversationId) {
        if (conversationId != null) {
            return conversationRepository
                    .findByIdAndUserId(conversationId, userId)
                    .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .title("New Conversation")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .messageCount(0)
                .totalTokens(0)
                .isActive(true)
                .build();

        return conversationRepository.save(conversation);
    }

    /**
     * Save message to database
     */
    private Message saveMessage(String conversationId, String role, String content, Integer tokenCount) {
        Message message = Message.builder()
                .id(UUID.randomUUID().toString())
                .conversationId(conversationId)
                .role(role)
                .content(content)
                .createdAt(LocalDateTime.now())
                .tokenCount(tokenCount)
                .model("gemini-1.5-flash")
                .build();

        return messageRepository.save(message);
    }

    /**
     * Update conversation metadata
     */
    private void updateConversation(Conversation conversation, String lastUserMessage, Integer tokenCount) {
        // Auto-generate title from first user message
        if ("New Conversation".equals(conversation.getTitle()) && lastUserMessage != null) {
            String title = lastUserMessage.length() > 50
                    ? lastUserMessage.substring(0, 47) + "..."
                    : lastUserMessage;
            conversation.setTitle(title);
        }

        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setMessageCount(conversation.getMessageCount() + 2); // user + assistant
        conversation.setTotalTokens(conversation.getTotalTokens() + (tokenCount != null ? tokenCount : 0));

        conversationRepository.save(conversation);
    }

    /**
     * Get conversation history
     */
    public List<Message> getConversationHistory(String userId, String conversationId) {
        // Verify ownership
        conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }
}