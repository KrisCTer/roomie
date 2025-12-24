// src/services/notificationService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8090/notification';

class NotificationService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Lấy danh sách notifications
   */
  async getNotifications(params = {}) {
    const { page = 0, size = 20, unreadOnly = false } = params;
    const response = await this.axiosInstance.get('/notifications', {
      params: { page, size, unreadOnly },
    });
    return response.data;
  }

  /**
   * Đếm số notifications chưa đọc
   */
  async getUnreadCount() {
    const response = await this.axiosInstance.get('/notifications/unread-count');
    return response.data.result;
  }

  /**
   * Lấy thống kê
   */
  async getStats() {
    const response = await this.axiosInstance.get('/notifications/stats');
    return response.data.result;
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(notificationId) {
    const response = await this.axiosInstance.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  /**
   * Đánh dấu nhiều notifications đã đọc
   */
  async markMultipleAsRead(notificationIds) {
    const response = await this.axiosInstance.put(
      '/notifications/read-multiple',
      notificationIds
    );
    return response.data;
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  async markAllAsRead() {
    const response = await this.axiosInstance.put('/notifications/read-all');
    return response.data;
  }

  /**
   * Xóa notification
   */
  async deleteNotification(notificationId) {
    const response = await this.axiosInstance.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  }

  /**
   * Xóa tất cả notifications đã đọc
   */
  async deleteAllRead() {
    const response = await this.axiosInstance.delete('/notifications/read');
    return response.data;
  }
}

export default new NotificationService();