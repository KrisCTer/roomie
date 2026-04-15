/* aria-label */
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
  Home,
  AlertTriangle,
  PenLine,
  XCircle,
  CreditCard,
} from "lucide-react";
import { useNotificationContext } from "../../../contexts/NotificationContext";

const TYPE_CONFIG = {
  BOOKING_CONFIRMED: { icon: CheckCircle2, color: "bg-emerald-100/80 text-emerald-700" },
  BOOKING_CANCELLED: { icon: XCircle, color: "bg-rose-100/80 text-rose-700" },
  CONTRACT_ACTIVATED: { icon: FileText, color: "bg-sky-100/80 text-sky-700" },
  CONTRACT_SIGNED: { icon: PenLine, color: "bg-indigo-100/80 text-indigo-700" },
  PAYMENT_COMPLETED: { icon: CreditCard, color: "bg-green-100/80 text-green-700" },
  PAYMENT_FAILED: { icon: AlertTriangle, color: "bg-amber-100/80 text-amber-700" },
  NEW_MESSAGE: { icon: MessageCircle, color: "bg-sky-100/80 text-sky-700" },
  PROPERTY_APPROVED: { icon: Home, color: "bg-teal-100/80 text-teal-700" },
  DEFAULT: { icon: Bell, color: "bg-orange-100/80 text-orange-700" },
};

const PRIORITY_CLASS = {
  URGENT: "bg-rose-100/80 text-rose-700 border-rose-200",
  HIGH: "bg-orange-100/80 text-orange-700 border-orange-200",
};

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

  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.DEFAULT;
  const Icon = config.icon;

  const handleClick = async () => {
    if (!notification.isRead) await markReadAction(notification.id);
    if (notification.actionUrl) {
      onNavigate ? onNavigate(notification.actionUrl) : (window.location.href = notification.actionUrl);
    }
    onClick?.();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteAction(notification.id);
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`apple-glass-panel interactive group cursor-pointer rounded-2xl p-4 md:p-5 mb-2 transition-all duration-200 hover:-translate-y-0.5 ${
        !notification.isRead ? "ring-1 ring-[var(--home-accent)]/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {notification.iconUrl ? (
            <img src={notification.iconUrl} alt="" className="w-11 h-11 rounded-full" />
          ) : (
            <div className={`w-11 h-11 rounded-xl ${config.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm home-text-primary ${!notification.isRead ? "font-bold" : "font-medium"}`}>
                {notification.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm home-text-muted">
                {notification.shortMessage || notification.message}
              </p>
            </div>

            <button
              onClick={handleDelete}
              aria-label="Delete notification"
              className="ml-2 flex-shrink-0 rounded-lg p-1.5 home-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs home-text-muted">
              {getTimeAgo(notification.createdAt)}
            </span>

            {notification.priority && notification.priority !== "NORMAL" && PRIORITY_CLASS[notification.priority] && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${PRIORITY_CLASS[notification.priority]}`}>
                {notification.priority}
              </span>
            )}

            {!notification.isRead && (
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--home-accent-strong)]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
