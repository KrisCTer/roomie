// src/components/NotificationItem.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { X } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const NotificationItem = ({ notification, onClick }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    onClick?.();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 border-red-400";
      case "HIGH":
        return "bg-orange-100 border-orange-400";
      case "NORMAL":
        return "bg-blue-100 border-blue-400";
      default:
        return "bg-gray-100 border-gray-400";
    }
  };

  const getTypeIcon = (type) => {
    // Return emoji or icon based on notification type
    const iconMap = {
      BOOKING_CONFIRMED: "✅",
      CONTRACT_ACTIVATED: "📝",
      PAYMENT_COMPLETED: "💰",
      NEW_MESSAGE: "💬",
      // Add more mappings
    };

    return iconMap[type] || "🔔";
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
        ${!notification.isRead ? "bg-blue-50" : "bg-white"}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {notification.iconUrl ? (
            <img
              src={notification.iconUrl}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
              {getTypeIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.shortMessage || notification.message}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="flex-shrink-0 ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">
              {getTimeAgo(notification.createdAt)}
            </span>

            {notification.priority !== "NORMAL" && (
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full border
                  ${getPriorityColor(notification.priority)}
                `}
              >
                {notification.priority}
              </span>
            )}

            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
