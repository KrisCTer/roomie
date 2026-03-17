import React from "react";
import { Filter } from "lucide-react";

const NotificationsFiltersSection = ({
  filter,
  setFilter,
  typeFilter,
  setTypeFilter,
  typeOptions,
  totalFiltered,
}) => {
  return (
    <section className="mb-6 rounded-2xl border border-[#EFE6DA] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Lọc:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "unread", label: "Chưa đọc" },
              { key: "read", label: "Đã đọc" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                  filter === item.key
                    ? "bg-gray-900 text-white"
                    : "bg-[#F6F2EA] text-gray-700 hover:bg-[#F0E9DD]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-[#E8DED1] px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="rounded-full border border-[#E8DED1] bg-[#FFFCF8] px-3 py-1 text-xs font-semibold text-gray-600">
            {totalFiltered} thông báo
          </span>
        </div>
      </div>
    </section>
  );
};

export default NotificationsFiltersSection;
