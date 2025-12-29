// web-app/src/components/Property/PropertyFilters.jsx
import React from "react";
import { Search, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const PropertyFilters = ({
  postStatus,
  setPostStatus,
  propertyStatus,
  setPropertyStatus,
  searchTerm,
  setSearchTerm,
  onClearFilters,
}) => {
  const { t } = useTranslation();

  const hasActiveFilters = postStatus || propertyStatus || searchTerm;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t("property.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">{t("common.filters")}:</span>
        </div>

        {/* Post Status Filter */}
        <select
          value={postStatus}
          onChange={(e) => setPostStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">{t("property.allPostStatus")}</option>
          <option value="DRAFT">{t("property.status.DRAFT")}</option>
          <option value="PENDING">{t("property.status.PENDING")}</option>
          <option value="APPROVED">{t("property.status.APPROVED")}</option>
          <option value="REJECTED">{t("property.status.REJECTED")}</option>
        </select>

        {/* Property Status Filter */}
        <select
          value={propertyStatus}
          onChange={(e) => setPropertyStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">{t("property.allPropertyStatus")}</option>
          <option value="AVAILABLE">
            {t("property.propertyStatus.AVAILABLE")}
          </option>
          <option value="RENTED">{t("property.propertyStatus.RENTED")}</option>
          <option value="MAINTENANCE">
            {t("property.propertyStatus.MAINTENANCE")}
          </option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <X className="w-4 h-4" />
            {t("common.clearFilters")}
          </button>
        )}

        {/* Active Filters Count */}
        {hasActiveFilters && (
          <span className="text-sm text-gray-600">
            {[postStatus, propertyStatus, searchTerm].filter(Boolean).length}{" "}
            {t("common.activeFilters")}
          </span>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;
