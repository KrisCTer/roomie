// src/services/aiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8091/ai';

class AiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('access_token') ||
                    localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Send message to AI
   */
  async chat(message, conversationId = null) {
    try {
      const response = await this.axiosInstance.post('/chat', {
        message,
        conversationId,
      });
      return response.data.result;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Get user's conversations
   */
  async getConversations(page = 0, size = 20) {
    try {
      const response = await this.axiosInstance.get('/chat/conversations', {
        params: { page, size },
      });
      return response.data.result;
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  }

  /**
   * Get single conversation
   */
  async getConversation(conversationId) {
    try {
      const response = await this.axiosInstance.get(`/chat/conversations/${conversationId}`);
      return response.data.result;
    } catch (error) {
      console.error('Error in getConversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId) {
    try {
      const response = await this.axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
      return response.data.result;
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  }

  /**
   * Update conversation title
   */
  async updateTitle(conversationId, title) {
    try {
      const response = await this.axiosInstance.put(
        `/chat/conversations/${conversationId}/title`,
        { title }
      );
      return response.data.result;
    } catch (error) {
      console.error('Error in updateTitle:', error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    try {
      const response = await this.axiosInstance.delete(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      throw error;
    }
  }
}

// ⭐ Export as named export AND default export
const aiServiceInstance = new AiService();
export { aiServiceInstance as aiService };
export default aiServiceInstance;