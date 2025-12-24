// RecentActivity.jsx
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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-4 p-4 bg-gray-100 rounded-xl"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <ActivityClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const color = getActivityColor(activity.type);
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            purple: "bg-purple-100 text-purple-600",
            yellow: "bg-yellow-100 text-yellow-600",
            gray: "bg-gray-100 text-gray-600",
          };

          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
