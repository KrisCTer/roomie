/* aria-label */
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
    blue: "bg-sky-100 text-sky-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    teal: "bg-teal-100 text-teal-700",
    indigo: "bg-indigo-100 text-indigo-700",
    pink: "bg-pink-100 text-pink-700",
  };

  return (
    <div
      onClick={onClick}
      className={`apple-glass-panel rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_18px_42px_rgba(17,24,39,0.18)] ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`apple-glass-item w-14 h-14 rounded-xl ${colorMap[color]} flex items-center justify-center`}
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
