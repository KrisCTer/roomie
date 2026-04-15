import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

const SearchFiltersHeaderSection = ({ activeFilterCount, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--home-border)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold home-text-primary">{t("filters.title")}</h2>
          <p className="text-xs home-text-muted font-medium">
            {activeFilterCount > 0
              ? t("filters.criteriaActive", { count: activeFilterCount })
              : t("filters.noCriteria")}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="apple-glass-panel interactive w-9 h-9 rounded-xl flex items-center justify-center home-text-muted hover:home-text-primary transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SearchFiltersHeaderSection;
