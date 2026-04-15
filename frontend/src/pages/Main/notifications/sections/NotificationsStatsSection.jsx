import React from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "../../../../components/domain/dashboard/StatCard.jsx";

const NotificationsStatsSection = ({ stats }) => {
  const { t } = useTranslation();

  if (!stats) return null;

  return (
    <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={Bell}
        label={t("notificationCenter.totalCount")}
        value={stats.totalNotifications}
        color="blue"
      />
      <StatCard
        icon={BellRing}
        label={t("notificationCenter.unreadCount")}
        value={stats.unreadCount}
        color="red"
      />
      <StatCard
        icon={CalendarDays}
        label={t("notificationCenter.todayCount")}
        value={stats.todayCount}
        color="green"
      />
      <StatCard
        icon={CalendarRange}
        label={t("notificationCenter.thisWeekCount")}
        value={stats.thisWeekCount}
        color="orange"
      />
    </section>
  );
};

export default NotificationsStatsSection;
