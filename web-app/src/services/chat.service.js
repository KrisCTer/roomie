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

/**
 * Lấy conversation detail
 * @param {string} conversationId - ID của conversation
 * @returns {Promise} Conversation detail
 */
export const getConversation = (conversationId) => {
  return httpClient
    .get(`${API.CONVERSATION_BASE}/${conversationId}`)
    .then((res) => res.data);
};

/**
 * Update conversation (đổi tên, avatar, etc.)
 * @param {string} conversationId - ID của conversation
 * @param {Object} data - { conversationName, conversationAvatar }
 * @returns {Promise} Updated conversation
 */
export const updateConversation = (conversationId, data) => {
  return httpClient
    .put(`${API.CONVERSATION_BASE}/${conversationId}`, data)
    .then((res) => res.data);
};

/**
 * Delete conversation
 * @param {string} conversationId - ID của conversation
 * @returns {Promise}
 */
export const deleteConversation = (conversationId) => {
  return httpClient
    .delete(`${API.CONVERSATION_BASE}/${conversationId}`)
    .then((res) => res.data);
};

/**
 * Rời khỏi conversation (for group chats)
 * @param {string} conversationId - ID của conversation
 * @returns {Promise}
 */
export const leaveConversation = (conversationId) => {
  return httpClient
    .post(`${API.CONVERSATION_BASE}/${conversationId}/leave`)
    .then((res) => res.data);
};

/**
 * Thêm participants vào group conversation
 * @param {string} conversationId - ID của conversation
 * @param {string[]} participantIds - Array of user IDs
 * @returns {Promise}
 */
export const addParticipants = (conversationId, participantIds) => {
  return httpClient
    .post(`${API.CONVERSATION_BASE}/${conversationId}/participants`, {
      participantIds,
    })
    .then((res) => res.data);
};

/**
 * Xóa message
 * @param {string} messageId - ID của message
 * @returns {Promise}
 */
export const deleteMessage = (messageId) => {
  return httpClient
    .delete(`${API.MESSAGE_BASE}/${messageId}`)
    .then((res) => res.data);
};

/**
 * Mark conversation as read
 * @param {string} conversationId - ID của conversation
 * @returns {Promise}
 */
export const markAsRead = (conversationId) => {
  return httpClient
    .post(`${API.CONVERSATION_BASE}/${conversationId}/read`)
    .then((res) => res.data);
};

/**
 * Get unread count
 * @returns {Promise<number>} Total unread messages
 */
export const getUnreadCount = () => {
  return httpClient
    .get(`${API.CONVERSATION_BASE}/unread-count`)
    .then((res) => res.data);
};

export default {
  getMyConversations,
  createConversation,
  createMessage,
  getMessages,
  getConversation,
  updateConversation,
  deleteConversation,
  leaveConversation,
  addParticipants,
  deleteMessage,
  markAsRead,
  getUnreadCount,
};