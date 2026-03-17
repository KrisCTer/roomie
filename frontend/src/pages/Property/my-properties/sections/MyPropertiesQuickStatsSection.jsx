import React from "react";
import { Building2, Clock3, CheckCircle2, Home } from "lucide-react";

const statItems = [
  {
    key: "totalOwned",
    label: "Tổng bất động sản",
    icon: Building2,
    tone: "home-tone-info",
  },
  {
    key: "available",
    label: "Sẵn sàng cho thuê",
    icon: Home,
    tone: "home-tone-success",
  },
  {
    key: "rented",
    label: "Đã cho thuê",
    icon: CheckCircle2,
    tone: "home-tone-success",
  },
  {
    key: "pending",
    label: "Đang chờ duyệt",
    icon: Clock3,
    tone: "home-tone-warning",
  },
];

const MyPropertiesQuickStatsSection = ({ quickStats }) => {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="home-glass-soft rounded-xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.tone}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="home-text-muted text-xs font-semibold">
                {item.label}
              </p>
            </div>
            <p className="home-text-primary text-2xl font-bold">
              {quickStats[item.key] ?? 0}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MyPropertiesQuickStatsSection;
