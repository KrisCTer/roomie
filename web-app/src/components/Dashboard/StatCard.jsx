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
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
    pink: "bg-pink-500/10 text-pink-400",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 transition-all hover:border-slate-600 hover:shadow-lg ${
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
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.type === "up" ? "text-green-400" : "text-red-400"
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
