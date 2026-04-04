package com.roomie.services.chat_service.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.roomie.services.chat_service.dto.request.ConversationRequest;
import com.roomie.services.chat_service.dto.response.ApiResponse;
import com.roomie.services.chat_service.dto.response.ConversationResponse;
import com.roomie.services.chat_service.service.ConversationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/create")
    public ApiResponse<ConversationResponse> createConversation(@RequestBody @Valid ConversationRequest request) {
        return ApiResponse.success(conversationService.create(request), "Created conversation successfully");
    }

    @GetMapping("/my-conversations")
    public ApiResponse<List<ConversationResponse>> myConversations() {
        return ApiResponse.success(conversationService.myConversations(), "Fetched conversations successfully");
    }
}
