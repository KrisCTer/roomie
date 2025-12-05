// src/services/chat.service.js
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

/**
 * Lấy danh sách conversations của user hiện tại
 * @returns {Promise} List of conversations
 */
export const getMyConversations = () => {
  return httpClient.get(API.MY_CONVERSATIONS).then((res) => res.data);
};

/**
 * Tạo conversation mới
 * @param {Object} data - { type: "DIRECT" | "GROUP", participantIds: string[] }
 * @returns {Promise} Created conversation
 */
export const createConversation = (data) => {
  return httpClient
    .post(API.CREATE_CONVERSATION, {
      type: data.type,
      participantIds: data.participantIds,
    })
    .then((res) => res.data);
};

/**
 * Gửi message mới
 * @param {Object} data - { conversationId: string, message: string }
 * @returns {Promise} Created message
 */
export const createMessage = (data) => {
  return httpClient
    .post(API.CREATE_MESSAGE, {
      conversationId: data.conversationId,
      message: data.message,
    })
    .then((res) => res.data);
};

/**
 * Lấy messages của một conversation
 * @param {string} conversationId - ID của conversation
 * @param {number} page - Page number (optional)
 * @param {number} size - Page size (optional)
 * @returns {Promise} List of messages
 */
export const getMessages = (conversationId, page, size) => {
  const params = { conversationId };
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;

  return httpClient.get(API.GET_MESSAGES, { params }).then((res) => res.data);
};

export default {
  getMyConversations,
  createConversation,
  createMessage,
  getMessages,
};