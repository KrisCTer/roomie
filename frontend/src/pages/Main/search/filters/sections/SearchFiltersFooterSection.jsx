import React from "react";
import { useTranslation } from "react-i18next";

const SearchFiltersFooterSection = ({
  activeFilterCount,
  onReset,
  onApply,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[var(--home-border)]">
      <button
        onClick={onReset}
        className="text-sm font-semibold home-text-muted underline underline-offset-2 transition hover:home-text-primary"
      >
        {t("filters.clearAll")}
      </button>
      <button
        onClick={onApply}
        className="apple-glass-panel interactive rounded-xl px-6 py-3 text-sm font-bold text-[var(--home-charcoal)] transition"
      >
        {activeFilterCount > 0
          ? t("filters.showResultsCount", { count: activeFilterCount })
          : t("filters.showResults")}
      </button>
    </div>
  );
};

export default SearchFiltersFooterSection;
