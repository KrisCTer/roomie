package com.roomie.services.ai_service.controller;

import com.roomie.services.ai_service.dto.request.ChatRequest;
import com.roomie.services.ai_service.dto.response.ApiResponse;
import com.roomie.services.ai_service.dto.response.ChatResponse;
import com.roomie.services.ai_service.dto.response.ConversationResponse;
import com.roomie.services.ai_service.entity.Message;
import com.roomie.services.ai_service.service.ChatService;
import com.roomie.services.ai_service.service.ConversationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatController {

    ChatService chatService;
    ConversationService conversationService;

    /**
     * Send message and get AI response
     */
    @PostMapping
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String userId = getCurrentUserId();
        log.info("Chat request from user: {}", userId);

        ChatResponse response = chatService.chat(userId, request);

        return ApiResponse.success(response, "Message sent successfully");
    }

    /**
     * Get user's conversations
     */
    @GetMapping("/conversations")
    public ApiResponse<Page<ConversationResponse>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String userId = getCurrentUserId();

        Page<ConversationResponse> conversations =
                conversationService.getUserConversations(userId, page, size);

        return ApiResponse.success(conversations, "Conversations retrieved successfully");
    }

    /**
     * Get single conversation
     */
    @GetMapping("/conversations/{id}")
    public ApiResponse<ConversationResponse> getConversation(@PathVariable String id) {
        String userId = getCurrentUserId();

        ConversationResponse conversation = conversationService.getConversation(userId, id);

        return ApiResponse.success(conversation, "Conversation retrieved successfully");
    }

    /**
     * Get conversation messages
     */
    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<Message>> getMessages(@PathVariable String id) {
        String userId = getCurrentUserId();

        List<Message> messages = chatService.getConversationHistory(userId, id);

        return ApiResponse.success(messages, "Messages retrieved successfully");
    }

    /**
     * Update conversation title
     */
    @PutMapping("/conversations/{id}/title")
    public ApiResponse<ConversationResponse> updateTitle(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String userId = getCurrentUserId();
        String newTitle = body.get("title");

        ConversationResponse conversation =
                conversationService.updateTitle(userId, id, newTitle);

        return ApiResponse.success(conversation, "Title updated successfully");
    }

    /**
     * Delete conversation
     */
    @DeleteMapping("/conversations/{id}")
    public ApiResponse<Void> deleteConversation(@PathVariable String id) {
        String userId = getCurrentUserId();

        conversationService.deleteConversation(userId, id);

        return ApiResponse.success(null, "Conversation deleted successfully");
    }

    // Helper method
    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}