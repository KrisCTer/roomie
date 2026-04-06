import React from "react";
import { Building2, Clock3, CheckCircle2, Home } from "lucide-react";
import StatCard from "../../../../components/domain/dashboard/StatCard";

const statItems = [
  { key: "totalOwned", label: "Tổng bất động sản", icon: Building2, color: "blue" },
  { key: "available", label: "Sẵn sàng cho thuê", icon: Home, color: "green" },
  { key: "rented", label: "Đã cho thuê", icon: CheckCircle2, color: "teal" },
  { key: "pending", label: "Đang chờ duyệt", icon: Clock3, color: "yellow" },
];

const MyPropertiesQuickStatsSection = ({ quickStats }) => {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item) => (
        <StatCard
          key={item.key}
          icon={item.icon}
          label={item.label}
          value={quickStats[item.key] ?? 0}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default MyPropertiesQuickStatsSection;
