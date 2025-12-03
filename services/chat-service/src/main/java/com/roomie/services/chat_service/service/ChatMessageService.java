package com.roomie.services.chat_service.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.roomie.services.chat_service.dto.request.ChatMessageRequest;
import com.roomie.services.chat_service.dto.response.ChatMessageResponse;
import com.roomie.services.chat_service.entity.ChatMessage;
import com.roomie.services.chat_service.entity.ParticipantInfo;
import com.roomie.services.chat_service.exception.AppException;
import com.roomie.services.chat_service.exception.ErrorCode;
import com.roomie.services.chat_service.mapper.ChatMessageMapper;
import com.roomie.services.chat_service.repository.ChatMessageRepository;
import com.roomie.services.chat_service.repository.ConversationRepository;
import com.roomie.services.chat_service.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    SocketIOServer server;
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    ProfileClient profileClient;

    ChatMessageMapper chatMessageMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        // Validate conversationId
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> userId.equals(participantInfo.getUserId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        // Validate conversationId
        conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> userId.equals(participantInfo.getUserId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Get UserInfo from ProfileService
        var userResponse = profileClient.getProfile(userId);
        if (Objects.isNull(userResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        var userInfo = userResponse.getResult();

        // Build Chat message Info
        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setSender(ParticipantInfo.builder()
                .userId(userInfo.getUserId())
                .username(userInfo.getUsername())
                .firstName(userInfo.getFirstName())
                .lastName(userInfo.getLastName())
                .avatar(userInfo.getAvatar())
                .build());
        chatMessage.setCreatedDate(Instant.now());

        // Create chat message
        chatMessage = chatMessageRepository.save(chatMessage);
        String message = chatMessage.getMessage();

        //Connected server
        server.getAllClients().stream().forEach(client -> {
            client.sendEvent("message", message);
        });

        // convert to Response
        return toChatMessageResponse(chatMessage);
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);

        chatMessageResponse.setMe(userId.equals(chatMessage.getSender().getUserId()));

        return chatMessageResponse;
    }
}
