import React from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import StatCard from "../../../../components/domain/dashboard/StatCard.jsx";

const NotificationsStatsSection = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Bell}
        label="Tổng số"
        value={stats.totalNotifications}
        color="blue"
      />

      <StatCard
        icon={BellRing}
        label="Chưa đọc"
        value={stats.unreadCount}
        color="red"
      />

      <StatCard
        icon={CalendarDays}
        label="Hôm nay"
        value={stats.todayCount}
        color="green"
      />

      <StatCard
        icon={CalendarRange}
        label="Tuần này"
        value={stats.thisWeekCount}
        color="orange"
      />
    </section>
  );
};

export default NotificationsStatsSection;
