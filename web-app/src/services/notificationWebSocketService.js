// src/services/notificationWebSocketService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class NotificationWebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.notificationHandler = null;
    this.unreadCountHandler = null;
  }

  /**
   * Connect to notification WebSocket
   */
  async connect(userId, token) {
    if (this.connected && this.stompClient) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {

        // Create SockJS connection
        const socket = new SockJS('http://localhost:8090/notification/ws/notifications');

        // Create STOMP client
        this.stompClient = Stomp.over(socket);

        // Disable debug in production
        this.stompClient.debug = (str) => {
        };

        // Connect with headers
        const connectHeaders = {
          Authorization: `Bearer ${token}`,
        };

        this.stompClient.connect(
          connectHeaders,
          // Success callback
          (frame) => {
            this.connected = true;
            this.reconnectAttempts = 0;

            // Subscribe to channels
            this.subscribeToChannels(userId);

            resolve();
          },
          // Error callback
          (error) => {
            console.error('❌ Notification WebSocket Error:', error);
            this.connected = false;
            
            // Try to reconnect
            this.handleReconnect(userId, token);
            
            reject(error);
          }
        );
      } catch (error) {
        console.error('❌ Error creating notification WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to notification channels
   */
  subscribeToChannels(userId) {
    if (!this.stompClient || !this.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    try {
      // Subscribe to user-specific notifications
      const notificationSub = this.stompClient.subscribe(
        `/user/${userId}/queue/notifications`,
        (message) => {
          try {
            const notification = JSON.parse(message.body);

            if (this.notificationHandler) {
              this.notificationHandler(notification);
            }
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        }
      );

      this.subscriptions.push(notificationSub);

      // Subscribe to unread count updates
      const countSub = this.stompClient.subscribe(
        `/user/${userId}/queue/unread-count`,
        (message) => {
          try {
            const count = parseInt(message.body);

            if (this.unreadCountHandler) {
              this.unreadCountHandler(count);
            }
          } catch (error) {
            console.error('Error parsing unread count:', error);
          }
        }
      );

      this.subscriptions.push(countSub);

    } catch (error) {
      console.error('Error subscribing to channels:', error);
    }
  }

  /**
   * Handle reconnection
   */
  handleReconnect(userId, token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    

    setTimeout(() => {
      this.connect(userId, token).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Set notification handler
   */
  onNotification(handler) {
    this.notificationHandler = handler;
  }

  /**
   * Set unread count handler
   */
  onUnreadCountUpdate(handler) {
    this.unreadCountHandler = handler;
  }

  /**
   * Send a message (for ping/pong or other actions)
   */
  send(destination, body) {
    if (!this.stompClient || !this.connected) {
      console.error('Cannot send: WebSocket not connected');
      return;
    }

    try {
      this.stompClient.send(destination, {}, JSON.stringify(body));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      try {
        // Unsubscribe from all subscriptions
        this.subscriptions.forEach((subscription) => {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        });
        this.subscriptions = [];

        // Disconnect
        this.stompClient.disconnect(() => {
        });

        this.stompClient = null;
        this.connected = false;
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.stompClient !== null;
  }
}

// Export singleton instance
export default new NotificationWebSocketService();