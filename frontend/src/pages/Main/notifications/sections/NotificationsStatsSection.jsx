import React from "react";

const NotificationsStatsSection = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-[#EEE1CE] bg-white p-4">
        <p className="mb-1 text-sm text-gray-600">Tổng số</p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.totalNotifications}
        </p>
      </div>

      <div className="rounded-2xl border border-[#F6D2D2] bg-[#FFF3F3] p-4">
        <p className="mb-1 text-sm text-red-600">Chưa đọc</p>
        <p className="text-2xl font-bold text-red-900">{stats.unreadCount}</p>
      </div>

      <div className="rounded-2xl border border-[#B8E7C8] bg-[#ECFDF3] p-4">
        <p className="mb-1 text-sm text-green-600">Hôm nay</p>
        <p className="text-2xl font-bold text-green-900">{stats.todayCount}</p>
      </div>

      <div className="rounded-2xl border border-[#CFE7FA] bg-[#EEF8FF] p-4">
        <p className="mb-1 text-sm text-sky-700">Tuần này</p>
        <p className="text-2xl font-bold text-sky-900">{stats.thisWeekCount}</p>
      </div>
    </section>
  );
};

export default NotificationsStatsSection;
