/* aria-label */
// Re-exports the unified StatCard from dashboard
// Maps legacy { bgColor, textColor } props → unified { color } prop
import React from "react";
import StatCard from "../dashboard/StatCard";

const colorFromBg = {
  "bg-blue-100": "blue",
  "bg-green-100": "green",
  "bg-yellow-100": "yellow",
  "bg-red-100": "red",
  "bg-teal-100": "teal",
  "bg-gray-100": "gray",
  "bg-indigo-100": "indigo",
  "bg-pink-100": "pink",
  "bg-orange-100": "yellow",
};

const StatsCard = ({ icon, label, value, bgColor, textColor, onClick }) => {
  const color = colorFromBg[bgColor] || "blue";
  return (
    <StatCard
      icon={icon}
      label={label}
      value={value}
      color={color}
      onClick={onClick}
    />
  );
};

export default StatsCard;
