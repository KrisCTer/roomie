/* aria-label */
// RecentActivity.jsx
import React from "react";
import {
  Clock as ActivityClock,
  Home as ActivityHome,
  FileText as ActivityFile,
  DollarSign as ActivityDollar,
} from "lucide-react";

const RecentActivity = ({ activities = [], loading, hasMore, onLoadMore }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      property: <ActivityHome className="w-5 h-5" />,
      booking: <ActivityClock className="w-5 h-5" />,
      contract: <ActivityFile className="w-5 h-5" />,
      payment: <ActivityDollar className="w-5 h-5" />,
    };
    return iconMap[type] || <ActivityClock className="w-5 h-5" />;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      property: "blue",
      booking: "green",
      contract: "teal",
      payment: "yellow",
    };
    return colorMap[type] || "gray";
  };

  if (loading) {
    return (
      <div className="apple-glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold home-text-primary mb-4">
          Hoạt động gần đây
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="apple-glass-soft animate-pulse flex items-center gap-4 rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-lg" style={{ background: "var(--home-surface-soft)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-3/4" style={{ background: "var(--home-surface-soft)" }} />
                <div className="h-3 rounded w-1/2" style={{ background: "var(--home-surface-soft)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="apple-glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold home-text-primary mb-4">
          Hoạt động gần đây
        </h2>
        <div className="text-center py-8">
          <ActivityClock className="w-12 h-12 home-text-muted mx-auto mb-3" />
          <p className="home-text-muted">Không có hoạt động gần đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-glass-panel rounded-2xl p-6">
      <h2 className="text-xl font-bold home-text-primary mb-4">
        Hoạt động gần đây
      </h2>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const color = getActivityColor(activity.type);
          const colorClasses = {
            blue: "bg-sky-100 text-sky-700",
            green: "bg-emerald-100 text-emerald-700",
            teal: "bg-teal-100 text-teal-700",
            yellow: "bg-amber-100 text-amber-700",
            gray: "bg-stone-100 text-stone-700",
          };

          return (
            <div
              key={index}
              className="apple-glass-item flex cursor-pointer items-center gap-4 rounded-xl p-4 transition hover:bg-white"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="home-text-primary font-medium">{activity.title}</p>
                <p className="text-sm home-text-muted">{activity.description}</p>
              </div>
              <span className="text-xs home-text-muted">{activity.time}</span>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="apple-glass-pill mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold home-text-accent hover:bg-white"
        >
          Tải thêm hoạt động
        </button>
      )}
    </div>
  );
};

export default RecentActivity;
