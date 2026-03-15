// src/services/websocketService.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketNotificationService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to notification WebSocket
   */
  async connect(userId, token) {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Create SockJS connection
        const socket = new SockJS('http://localhost:8090/notification/ws/notifications');

        // Create STOMP client
        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // On successful connection
        this.client.onConnect = (frame) => {
          this.connected = true;
          this.reconnectAttempts = 0;

          // Subscribe to user-specific notifications
          this.subscribeToUserNotifications(userId);

          resolve();
        };

        // On error
        this.client.onStompError = (frame) => {
          console.error('❌ STOMP Error:', frame);
          this.connected = false;
          reject(new Error(frame.headers?.message || 'STOMP connection error'));
        };

        // On disconnect
        this.client.onDisconnect = () => {
          this.connected = false;
        };

        // On web socket error
        this.client.onWebSocketError = (error) => {
          console.error('❌ WebSocket Error:', error);
          this.handleReconnect(userId, token);
        };

        // Activate the client
        this.client.activate();
      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to user-specific notifications
   */
  subscribeToUserNotifications(userId) {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    // Subscribe to user's notification queue
    const subscription = this.client.subscribe(
      `/user/${userId}/queue/notifications`,
      (message) => {
        try {
          const notification = JSON.parse(message.body);
          
          // Call the notification handler
          if (this.notificationHandler) {
            this.notificationHandler(notification);
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    );

    this.subscriptions.notifications = subscription;

    // Subscribe to unread count updates
    const countSubscription = this.client.subscribe(
      `/user/${userId}/queue/unread-count`,
      (message) => {
        try {
          const count = parseInt(message.body);
          
          // Call the unread count handler
          if (this.unreadCountHandler) {
            this.unreadCountHandler(count);
          }
        } catch (error) {
          console.error('Error parsing unread count:', error);
        }
      }
    );

    this.subscriptions.unreadCount = countSubscription;

  }

  /**
   * Handle reconnection
   */
  handleReconnect(userId, token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect(userId, token).catch(console.error);
    }, this.reconnectDelay * this.reconnectAttempts);
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
   * Send a message (for ping/pong)
   */
  send(destination, body) {
    if (!this.client || !this.connected) {
      console.error('Cannot send: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all subscriptions
      Object.values(this.subscriptions).forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions = {};

      // Deactivate client
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }
}

export default new WebSocketNotificationService();