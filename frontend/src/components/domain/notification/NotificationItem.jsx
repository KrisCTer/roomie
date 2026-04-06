/* aria-label */
// src/components/NotificationItem.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  X,
  Bell,
  CheckCircle2,
  FileText,
  Wallet,
  MessageCircle,
} from "lucide-react";
import { useNotificationContext } from "../../../contexts/NotificationContext";

const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  onNavigate,
}) => {
  const { markAsRead, deleteNotification } = useNotificationContext();

  const markReadAction = onMarkAsRead || markAsRead;
  const deleteAction = onDelete || deleteNotification;

  const handleClick = async () => {
    if (!notification.isRead) {
      await markReadAction(notification.id);
    }

    if (notification.actionUrl) {
      if (onNavigate) {
        onNavigate(notification.actionUrl);
      } else {
        window.location.href = notification.actionUrl;
      }
    }

    onClick?.();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteAction(notification.id);
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
        return "bg-rose-100 border-rose-300 text-rose-800";
      case "HIGH":
        return "bg-amber-100 border-amber-300 text-amber-800";
      case "NORMAL":
        return "bg-sky-100 border-sky-300 text-sky-800";
      default:
        return "bg-stone-100 border-stone-300 text-stone-800";
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      BOOKING_CONFIRMED: CheckCircle2,
      CONTRACT_ACTIVATED: FileText,
      PAYMENT_COMPLETED: Wallet,
      NEW_MESSAGE: MessageCircle,
    };

    const Icon = iconMap[type] || Bell;
    return <Icon className="w-5 h-5 text-[#A8653A]" />;
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 border-b border-[#F3ECE2] hover:bg-[#FAF6EF] cursor-pointer transition-colors
        ${!notification.isRead ? "bg-[#FFF4E8]" : "bg-white"}
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
            <div className="w-10 h-10 rounded-full bg-[#F3E8D9] flex items-center justify-center">
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
              aria-label="Delete notification"
              className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-[#F3ECE2] text-gray-400 hover:text-gray-600"
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
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
