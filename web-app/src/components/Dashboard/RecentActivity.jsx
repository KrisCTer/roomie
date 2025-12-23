import React from "react";
import {
  Clock as ActivityClock,
  Home as ActivityHome,
  FileText as ActivityFile,
  DollarSign as ActivityDollar,
} from "lucide-react";

const RecentActivity = ({ activities = [], loading }) => {
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
      contract: "purple",
      payment: "yellow",
    };
    return colorMap[type] || "gray";
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl"
            >
              <div className="w-10 h-10 bg-slate-600 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-600 rounded w-3/4" />
                <div className="h-3 bg-slate-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
        <div className="text-center py-8">
          <ActivityClock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Chưa có hoạt động nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const color = getActivityColor(activity.type);
          const colorClasses = {
            blue: "bg-blue-500/10 text-blue-400",
            green: "bg-green-500/10 text-green-400",
            purple: "bg-purple-500/10 text-purple-400",
            yellow: "bg-yellow-500/10 text-yellow-400",
            gray: "bg-gray-500/10 text-gray-400",
          };

          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.title}</p>
                <p className="text-sm text-slate-400">{activity.description}</p>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
