import React from "react";
import { Building2 } from "lucide-react";

const MyPropertiesEmptySection = ({
  hasFilters,
  onClearFilters,
  emptyTitle,
  emptyDescription,
  clearFiltersLabel,
}) => {
  return (
    <div className="home-glass-soft rounded-2xl border border-dashed py-12 text-center">
      <Building2 className="home-text-muted mx-auto mb-3 h-12 w-12" />
      <h3 className="home-text-primary mb-2 text-lg font-semibold">
        {emptyTitle}
      </h3>
      <p className="home-text-muted mx-auto max-w-xl text-sm">
        {emptyDescription}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="home-btn-accent mt-4 px-4 py-2 text-sm font-semibold"
        >
          {clearFiltersLabel}
        </button>
      )}
    </div>
  );
};

export default MyPropertiesEmptySection;
