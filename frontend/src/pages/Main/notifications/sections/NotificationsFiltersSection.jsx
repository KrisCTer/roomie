import React from "react";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

const NotificationsFiltersSection = ({
  filter,
  setFilter,
  typeFilter,
  setTypeFilter,
  typeOptions,
  totalFiltered,
}) => {
  const { t } = useTranslation();

  const filterTabs = [
    { key: "all", label: t("notificationCenter.all") },
    { key: "unread", label: t("notificationCenter.unread") },
    { key: "read", label: t("notificationCenter.read") },
  ];

  return (
    <section className="apple-glass-panel mb-6 rounded-2xl p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 home-text-muted" />
            <span className="text-sm font-semibold home-text-primary">{t("notificationCenter.filter")}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filterTabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  filter === item.key
                    ? "bg-[var(--home-charcoal)] text-white shadow-sm"
                    : "apple-glass-panel interactive home-text-muted hover:home-text-primary"
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
            className="apple-glass-panel rounded-xl px-4 py-2.5 text-sm font-medium home-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--home-accent)]/40"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="apple-glass-pill rounded-full px-3 py-1.5 text-xs font-bold home-text-muted">
            {totalFiltered} {t("notificationCenter.notifications")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default NotificationsFiltersSection;
