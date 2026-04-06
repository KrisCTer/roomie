/* aria-label */
import React from "react";

const colorMap = {
  blue: "bg-sky-100/80 text-sky-700",
  green: "bg-emerald-100/80 text-emerald-700",
  yellow: "bg-amber-100/80 text-amber-700",
  red: "bg-rose-100/80 text-rose-700",
  teal: "bg-teal-100/80 text-teal-700",
  indigo: "bg-indigo-100/80 text-indigo-700",
  pink: "bg-pink-100/80 text-pink-700",
  gray: "bg-gray-100/80 text-gray-600",
  orange: "bg-orange-100/80 text-orange-700",
};

const StatCard = ({ icon: Icon, label, value, color = "blue", trend, subtitle, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`apple-glass-panel rounded-2xl p-5 ${
        onClick ? "interactive" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${colorMap[color] || colorMap.blue} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm home-text-muted mb-1 truncate">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold home-text-primary">{value}</p>
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
          {subtitle && (
            <p className="text-xs home-text-muted mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

