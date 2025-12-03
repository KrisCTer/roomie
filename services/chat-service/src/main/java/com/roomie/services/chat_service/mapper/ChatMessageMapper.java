package com.roomie.services.chat_service.mapper;

import com.roomie.services.chat_service.dto.request.ChatMessageRequest;
import com.roomie.services.chat_service.dto.response.ChatMessageResponse;
import com.roomie.services.chat_service.entity.ChatMessage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);

    ChatMessage toChatMessage(ChatMessageRequest request);

    List<ChatMessageResponse> toChatMessageResponses(List<ChatMessage> chatMessages);
}
