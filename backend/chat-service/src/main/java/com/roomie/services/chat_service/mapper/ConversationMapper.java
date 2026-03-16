package com.roomie.services.chat_service.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.roomie.services.chat_service.dto.response.ConversationResponse;
import com.roomie.services.chat_service.entity.Conversation;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    ConversationResponse toConversationResponse(Conversation conversation);

    List<ConversationResponse> toConversationResponseList(List<Conversation> conversations);
}
