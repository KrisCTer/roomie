import { useEffect, useMemo, useState } from "react";
import { useNotificationContext } from "../../../../contexts/NotificationContext";
import notificationService from "../../../../services/notificationService";

const DEFAULT_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "BOOKING_CONFIRMED", label: "Đặt phòng" },
  { value: "CONTRACT_ACTIVATED", label: "Hợp đồng" },
  { value: "PAYMENT_COMPLETED", label: "Thanh toán" },
  { value: "NEW_MESSAGE", label: "Tin nhắn" },
];

const PAGE_SIZE = 12;

const parseNotificationPage = (response) => {
  const result = response?.result || {};
  const content = Array.isArray(result.content)
    ? result.content
    : Array.isArray(response?.content)
      ? response.content
      : [];

  const isLast =
    typeof result.last === "boolean"
      ? result.last
      : content.length < PAGE_SIZE;

  return { content, isLast };
};

const useNotificationCenterData = () => {
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: refreshContext,
  } = useNotificationContext();

  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const statsData = await notificationService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading notification stats:", error);
    }
  };

  const fetchPage = async ({ pageToLoad, append }) => {
    const response = await notificationService.getNotifications({
      page: pageToLoad,
      size: PAGE_SIZE,
    });
    const { content, isLast } = parseNotificationPage(response);

    setNotifications((prev) => {
      if (!append) return content;

      const existingIds = new Set(prev.map((item) => item.id));
      const dedupedIncoming = content.filter((item) => !existingIds.has(item.id));
      return [...prev, ...dedupedIncoming];
    });

    setPage(pageToLoad);
    setHasMore(!isLast);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInitial(true);
      try {
        await Promise.all([
          fetchPage({ pageToLoad: 0, append: false }),
          loadStats(),
        ]);
      } catch (error) {
        console.error("Error loading notification center:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitialData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPage({ pageToLoad: 0, append: false }),
        loadStats(),
        refreshContext(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || refreshing || loadingInitial || !hasMore) {
      return;
    }

    setLoadingMore(true);
    try {
      await fetchPage({ pageToLoad: page + 1, append: true });
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tất cả thông báo đã đọc?")) {
      return;
    }

    try {
      setRefreshing(true);
      await notificationService.deleteAllRead();
      await Promise.all([
        fetchPage({ pageToLoad: 0, append: false }),
        loadStats(),
        refreshContext(),
      ]);
    } catch (error) {
      console.error("Error deleting read notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification,
        ),
      );
      await loadStats();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteOne = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId),
      );
      await loadStats();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
      await loadStats();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "unread" && notification.isRead) return false;
      if (filter === "read" && !notification.isRead) return false;
      if (typeFilter !== "all" && notification.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, filter, typeFilter]);

  const typeOptions = useMemo(() => {
    const existingTypes = Array.from(
      new Set(notifications.map((notification) => notification.type).filter(Boolean)),
    );

    const knownValues = new Set(DEFAULT_TYPE_OPTIONS.map((item) => item.value));
    const extraDynamicOptions = existingTypes
      .filter((value) => !knownValues.has(value))
      .map((value) => ({ value, label: value }));

    return [...DEFAULT_TYPE_OPTIONS, ...extraDynamicOptions];
  }, [notifications]);

  return {
    notifications,
    filteredNotifications,
    hasMore,
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    typeOptions,
    stats,
    loadingInitial,
    loadingMore,
    refreshing,
    handleLoadMore,
    handleMarkAsRead,
    handleDeleteOne,
    handleMarkAllAsRead,
    handleRefresh,
    handleDeleteAllRead,
  };
};

export default useNotificationCenterData;
