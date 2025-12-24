// src/services/websocketService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Kết nối WebSocket
   */
  connect(userId, token) {
    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS('http://localhost:8090/notification/ws/notifications');
        this.stompClient = Stomp.over(socket);

        // Disable debug logs
        this.stompClient.debug = () => {};

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        this.stompClient.connect(
          headers,
          (frame) => {
            console.log('WebSocket Connected:', frame);
            this.connected = true;
            this.reconnectAttempts = 0;

            // Subscribe to user-specific notifications
            this.subscribeToNotifications(userId);

            resolve();
          },
          (error) => {
            console.error('WebSocket Connection Error:', error);
            this.connected = false;
            this.handleReconnect(userId, token);
            reject(error);
          }
        );
      } catch (error) {
        console.error('WebSocket Setup Error:', error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(userId) {
    if (!this.stompClient || !this.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    // Subscribe to user-specific queue
    const subscription = this.stompClient.subscribe(
      `/user/${userId}/queue/notifications`,
      (message) => {
        try {
          const notification = JSON.parse(message.body);
          this.notifySubscribers('notification', notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    );

    this.subscribers.set('notifications', subscription);

    // Subscribe to unread count updates
    const countSubscription = this.stompClient.subscribe(
      `/user/${userId}/queue/unread-count`,
      (message) => {
        try {
          const count = JSON.parse(message.body);
          this.notifySubscribers('unread-count', count);
        } catch (error) {
          console.error('Error parsing unread count:', error);
        }
      }
    );

    this.subscribers.set('unread-count', countSubscription);
  }

  /**
   * Handle reconnection
   */
  handleReconnect(userId, token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(userId, token);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Register callback for notifications
   */
  onNotification(callback) {
    this.notificationCallback = callback;
  }

  /**
   * Register callback for unread count
   */
  onUnreadCountUpdate(callback) {
    this.unreadCountCallback = callback;
  }

  /**
   * Notify all subscribers
   */
  notifySubscribers(type, data) {
    if (type === 'notification' && this.notificationCallback) {
      this.notificationCallback(data);
    } else if (type === 'unread-count' && this.unreadCountCallback) {
      this.unreadCountCallback(data);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.stompClient && this.connected) {
      // Unsubscribe all
      this.subscribers.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscribers.clear();

      this.stompClient.disconnect(() => {
        console.log('WebSocket Disconnected');
        this.connected = false;
      });
    }
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();