// src/services/chat.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const getMyConversations = () =>
  BaseService.get(API.MY_CONVERSATIONS);

export const createConversation = (data) =>
  BaseService.post(API.CREATE_CONVERSATION, {
    type: data.type,
    participantIds: data.participantIds,
  });

export const createMessage = (data) =>
  BaseService.post(API.CREATE_MESSAGE, {
    conversationId: data.conversationId,
    message: data.message,
  });

export const getMessages = (conversationId, page, size) =>
  BaseService.get(API.GET_MESSAGES, { conversationId, page, size });
