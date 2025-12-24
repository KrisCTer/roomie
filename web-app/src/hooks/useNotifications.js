// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import websocketService from '../services/websocketService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (pageNum = 0, unreadOnly = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getNotifications({
        page: pageNum,
        size: 20,
        unreadOnly,
      });

      if (pageNum === 0) {
        setNotifications(response.result.content);
      } else {
        setNotifications((prev) => [...prev, ...response.result.content]);
      }

      setHasMore(!response.result.last);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  /**
   * Mark as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if necessary
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  /**
   * Handle new real-time notification
   */
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast notification (implement toast separately)
    showToast(notification);
  }, []);

  /**
   * Handle unread count update
   */
  const handleUnreadCountUpdate = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  /**
   * Load more notifications
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    fetchNotifications(0);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Setup WebSocket listeners
  useEffect(() => {
    websocketService.onNotification(handleNewNotification);
    websocketService.onUnreadCountUpdate(handleUnreadCountUpdate);

    return () => {
      websocketService.onNotification(null);
      websocketService.onUnreadCountUpdate(null);
    };
  }, [handleNewNotification, handleUnreadCountUpdate]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
  };
};

// Simple toast notification (you can use a library like react-toastify)
const showToast = (notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.shortMessage || notification.message,
      icon: notification.iconUrl || '/logo.png',
      tag: notification.id,
    });
  }
};