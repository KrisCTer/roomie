// src/contexts/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
// ⭐ Thay đổi import này theo auth context hiện có của bạn
// Ví dụ: import { useUser } from "./UserContext";
// hoặc: import { useAuthentication } from "./AuthenticationContext";
import { getToken, getCompleteUserInfo } from "../services/localStorageService";
import notificationService from "../services/notificationService";
import websocketService from "../services/websocketService";

const NotificationContext = createContext(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // ⭐ Lấy user info từ localStorage thay vì auth context
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  // ⭐ Load user từ localStorage
  useEffect(() => {
    const storedToken = getToken();
    const completeUser = getCompleteUserInfo();

    if (storedToken && completeUser) {
      setToken(storedToken);
      setUser({
        id: completeUser.userId,
        userId: completeUser.userId,
        username: completeUser.username,
        firstName: completeUser.firstName,
        lastName: completeUser.lastName,
        avatar: completeUser.avatar,
        email: completeUser.email,
      });
    }
  }, []);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!user?.id || !token) return;

    const initWebSocket = async () => {
      try {
        await websocketService.connect(user.id, token);
        setWsConnected(true);
        console.log("✅ Notification WebSocket connected");

        // Setup listeners
        websocketService.onNotification(handleNewNotification);
        websocketService.onUnreadCountUpdate(setUnreadCount);
      } catch (error) {
        console.error("❌ Notification WebSocket error:", error);
        setWsConnected(false);
      }
    };

    initWebSocket();

    return () => {
      websocketService.disconnect();
      setWsConnected(false);
    };
  }, [user?.id, token]);

  /**
   * Fetch initial data
   */
  useEffect(() => {
    if (!user?.id) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [notificationsResponse, unreadCountResponse] = await Promise.all([
          notificationService.getNotifications({ page: 0, size: 20 }),
          notificationService.getUnreadCount(),
        ]);

        setNotifications(notificationsResponse.result.content);
        setUnreadCount(unreadCountResponse);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?.id]);

  /**
   * Handle new notification from WebSocket
   */
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    addToast(notification);
    playNotificationSound();
    showBrowserNotification(notification);
  }, []);

  /**
   * Add toast to queue
   */
  const addToast = useCallback((notification) => {
    const toast = {
      id: notification.id,
      ...notification,
      timestamp: Date.now(),
    };

    setToastQueue((prev) => [...prev, toast]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
  }, []);

  /**
   * Remove toast from queue
   */
  const removeToast = useCallback((toastId) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  /**
   * Show browser notification
   */
  const showBrowserNotification = useCallback((notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const browserNotification = new Notification(notification.title, {
        body: notification.shortMessage || notification.message,
        icon: notification.iconUrl || "/logo.png",
        tag: notification.id,
        requireInteraction: notification.priority === "URGENT",
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };
    }
  }, []);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  /**
   * Mark as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
      throw error;
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
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await notificationService.deleteNotification(notificationId);

        const notification = notifications.find((n) => n.id === notificationId);

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
      }
    },
    [notifications]
  );

  /**
   * Refresh notifications
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        notificationService.getNotifications({ page: 0, size: 20 }),
        notificationService.getUnreadCount(),
      ]);

      setNotifications(notificationsResponse.result.content);
      setUnreadCount(unreadCountResponse);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    wsConnected,
    toastQueue,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    removeToast,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
