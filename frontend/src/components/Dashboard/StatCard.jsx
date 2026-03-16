// src/pages/User/Dashboard/components/StatCard.jsx
import React from "react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "blue",
  trend,
  onClick,
}) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    indigo: "bg-indigo-100 text-indigo-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:border-gray-300 hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl ${colorMap[color]} flex items-center justify-center`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.type === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
