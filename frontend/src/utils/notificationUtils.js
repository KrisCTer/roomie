// src/utils/notificationUtils.js
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format time ago in Vietnamese
 */
export const formatTimeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: vi,
    });
  } catch {
    return '';
  }
};

/**
 * Get notification type display name
 */
export const getNotificationTypeName = (type) => {
  const typeNames = {
    // Booking
    BOOKING_CREATED: 'Đặt phòng mới',
    BOOKING_CONFIRMED: 'Đặt phòng được xác nhận',
    BOOKING_CANCELLED: 'Đặt phòng đã hủy',
    BOOKING_REJECTED: 'Đặt phòng bị từ chối',
    BOOKING_EXPIRED: 'Đặt phòng hết hạn',

    // Contract
    CONTRACT_CREATED: 'Hợp đồng mới',
    CONTRACT_SIGNED: 'Hợp đồng đã ký',
    CONTRACT_ACTIVATED: 'Hợp đồng kích hoạt',
    CONTRACT_TERMINATED: 'Hợp đồng chấm dứt',
    CONTRACT_EXPIRED: 'Hợp đồng hết hạn',
    CONTRACT_EXPIRING_SOON: 'Hợp đồng sắp hết hạn',

    // Payment
    PAYMENT_COMPLETED: 'Thanh toán thành công',
    PAYMENT_FAILED: 'Thanh toán thất bại',
    PAYMENT_DUE_SOON: 'Sắp đến hạn thanh toán',
    PAYMENT_OVERDUE: 'Quá hạn thanh toán',

    // Property
    PROPERTY_APPROVED: 'Phòng được duyệt',
    PROPERTY_REJECTED: 'Phòng bị từ chối',

    // Message
    NEW_MESSAGE: 'Tin nhắn mới',

    // System
    SYSTEM_ANNOUNCEMENT: 'Thông báo hệ thống',
  };

  return typeNames[type] || type;
};

/**
 * Get notification icon
 */
export const getNotificationIcon = (type) => {
  const iconMap = {
    BOOKING_CONFIRMED: '✅',
    BOOKING_CANCELLED: '❌',
    BOOKING_REJECTED: '⛔',
    CONTRACT_ACTIVATED: '📝',
    CONTRACT_SIGNED: '✍️',
    PAYMENT_COMPLETED: '💰',
    PAYMENT_FAILED: '❗',
    PAYMENT_OVERDUE: '⚠️',
    NEW_MESSAGE: '💬',
    PROPERTY_APPROVED: '🏠',
    SYSTEM_ANNOUNCEMENT: '📢',
  };

  return iconMap[type] || '🔔';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    LOW: {
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      text: 'text-gray-700',
    },
    NORMAL: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-700',
    },
    HIGH: {
      bg: 'bg-orange-100',
      border: 'border-orange-400',
      text: 'text-orange-700',
    },
    URGENT: {
      bg: 'bg-red-100',
      border: 'border-red-400',
      text: 'text-red-700',
    },
  };

  return colors[priority] || colors.NORMAL;
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);

    if (date >= today) {
      groups.today.push(notification);
    } else if (date >= yesterday) {
      groups.yesterday.push(notification);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(notification);
    } else if (date >= monthAgo) {
      groups.thisMonth.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
};

/**
 * Check if notification is important
 */
export const isImportantNotification = (notification) => {
  const importantTypes = [
    'BOOKING_CONFIRMED',
    'CONTRACT_ACTIVATED',
    'PAYMENT_COMPLETED',
    'PAYMENT_FAILED',
    'PAYMENT_OVERDUE',
  ];

  return (
    notification.priority === 'URGENT' ||
    notification.priority === 'HIGH' ||
    importantTypes.includes(notification.type)
  );
};