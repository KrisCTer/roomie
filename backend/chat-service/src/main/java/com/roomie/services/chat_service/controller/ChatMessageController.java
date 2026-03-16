package com.roomie.services.chat_service.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.roomie.services.chat_service.dto.request.ChatMessageRequest;
import com.roomie.services.chat_service.dto.response.ApiResponse;
import com.roomie.services.chat_service.dto.response.ChatMessageResponse;
import com.roomie.services.chat_service.service.ChatMessageService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("messages")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageController {
    ChatMessageService chatMessageService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> create(@RequestBody @Valid ChatMessageRequest request) {

        ChatMessageResponse data = chatMessageService.create(request);

        return ResponseEntity.ok(ApiResponse.success(data, "Created message successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @RequestParam("conversationId") String conversationId) {

        List<ChatMessageResponse> data = chatMessageService.getMessages(conversationId);

        return ResponseEntity.ok(ApiResponse.success(data, "Fetched chat messages successfully"));
    }
}
