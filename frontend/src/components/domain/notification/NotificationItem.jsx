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
        return "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]";
      case "HIGH":
        return "bg-[#FFF4E8] border-[#F5D9C4] text-[#9A3412]";
      case "NORMAL":
        return "bg-[#EFF6FF] border-[#D7E4FF] text-[#1D4ED8]";
      default:
        return "bg-[#F3F4F6] border-[#D1D5DB] text-[#4B5563]";
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
        cursor-pointer rounded-[24px] border p-4 md:p-5 transition-all duration-200
        hover:-translate-y-0.5 hover:border-[#B45309] hover:ring-2 hover:ring-[#CC6F4A]/30 hover:shadow-[0_18px_40px_rgba(98,60,26,0.14)]
        ${
          !notification.isRead
            ? "border-[#F2D8BE] bg-gradient-to-br from-[#FFF9F2] via-[#FFF4E8] to-[#FFEEDF]"
            : "border-[#E8D8C7] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF6ED]"
        }
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
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0DECB] bg-white/90 shadow-sm">
              {getTypeIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1F2937]">
                {notification.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-[#6B7280]">
                {notification.shortMessage || notification.message}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              aria-label="Delete notification"
              className="ml-2 flex-shrink-0 rounded-lg p-1 text-[#9CA3AF] transition hover:bg-white/70 hover:text-[#6B7280]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#8A837A]">
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
              <span className="h-2.5 w-2.5 rounded-full bg-[#CC6F4A]"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
