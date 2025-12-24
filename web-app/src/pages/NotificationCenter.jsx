// src/pages/NotificationCenter.jsx
import React, { useState, useEffect } from "react";
import { Bell, Filter, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import NotificationItem from "../components/Notification/NotificationItem";
import { useNotificationContext } from "../contexts/NotificationContext";
import notificationService from "../services/notificationService";

const NotificationCenter = () => {
  const { notifications, unreadCount, markAllAsRead, refresh } =
    useNotificationContext();
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await notificationService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refresh();
    await loadStats();
    setLoading(false);
  };

  const handleDeleteAllRead = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả thông báo đã đọc?")) {
      try {
        await notificationService.deleteAllRead();
        await refresh();
        await loadStats();
      } catch (error) {
        console.error("Error deleting read notifications:", error);
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread" && n.isRead) return false;
    if (filter === "read" && !n.isRead) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Trung tâm thông báo
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>

            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCheck className="w-4 h-4" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Tổng số</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalNotifications}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Chưa đọc</p>
              <p className="text-2xl font-bold text-red-900">
                {stats.unreadCount}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Hôm nay</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.todayCount}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Tuần này</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.thisWeekCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Lọc:</span>
            </div>

            <div className="flex gap-2">
              {["all", "unread", "read"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2 text-sm rounded-lg transition-colors
                    ${
                      filter === f
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {f === "all"
                    ? "Tất cả"
                    : f === "unread"
                    ? "Chưa đọc"
                    : "Đã đọc"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDeleteAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa đã đọc
          </button>
        </div>

        {/* Type Filter */}
        <div className="mt-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="BOOKING_CONFIRMED">Đặt phòng</option>
            <option value="CONTRACT_ACTIVATED">Hợp đồng</option>
            <option value="PAYMENT_COMPLETED">Thanh toán</option>
            <option value="NEW_MESSAGE">Tin nhắn</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không có thông báo nào</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
