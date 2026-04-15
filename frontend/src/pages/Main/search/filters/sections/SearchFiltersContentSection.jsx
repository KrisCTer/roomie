import React from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  DEFAULT_FILTERS,
  PROPERTY_TYPES,
  RADIUS_OPTIONS,
} from "../utils/filterOptions";

const SearchFiltersContentSection = ({
  localFilters,
  setLocalFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslation();
  const [gettingLocation, setGettingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("filters.locationUnsupported"));
      return;
    }
    setGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocalFilters({
          ...localFilters,
          nearbyEnabled: true,
          nearbyLat: position.coords.latitude,
          nearbyLng: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        let msg = "";
        if (error.code === error.PERMISSION_DENIED) msg = t("filters.locationDenied");
        else if (error.code === error.POSITION_UNAVAILABLE) msg = t("filters.locationUnavailable");
        else msg = t("filters.locationTimeout");
        setLocationError(msg);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  const handleClearNearby = () => {
    setLocalFilters({ ...localFilters, nearbyEnabled: false, nearbyLat: null, nearbyLng: null, nearbyRadiusKm: 5 });
    setLocationError(null);
  };

  const isTypeSelected = (val) => localFilters.propertyTypes.includes(val);
  const toggleType = (val) => {
    const newTypes = isTypeSelected(val)
      ? localFilters.propertyTypes.filter((v) => v !== val)
      : [...localFilters.propertyTypes, val];
    setLocalFilters({ ...localFilters, propertyTypes: newTypes });
  };

  return (
    <div className="flex-1 overflow-auto px-5 py-5 space-y-6">

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(localFilters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
            localFilters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) && (
            <span className="apple-glass-pill rounded-full px-3 py-1 text-xs font-semibold home-text-muted">
              {t("filters.price")}: {localFilters.priceRange[0].toLocaleString("vi-VN")}đ - {localFilters.priceRange[1].toLocaleString("vi-VN")}đ
            </span>
          )}
          {localFilters.propertyTypes.length > 0 && (
            <span className="apple-glass-pill rounded-full px-3 py-1 text-xs font-semibold home-text-muted">
              {t("filters.type")}: {localFilters.propertyTypes.length}
            </span>
          )}
          {localFilters.bedrooms > 0 && (
            <span className="apple-glass-pill rounded-full px-3 py-1 text-xs font-semibold home-text-muted">
              {t("filters.bedrooms")}: {localFilters.bedrooms === 4 ? "4+" : localFilters.bedrooms}
            </span>
          )}
          {localFilters.bathrooms > 0 && (
            <span className="apple-glass-pill rounded-full px-3 py-1 text-xs font-semibold home-text-muted">
              {t("filters.bathrooms")}: {localFilters.bathrooms === 3 ? "3+" : localFilters.bathrooms}
            </span>
          )}
          {localFilters.nearbyEnabled && (
            <span className="apple-glass-pill rounded-full px-3 py-1 text-xs font-semibold home-text-muted">
              {t("filters.nearby")}: {localFilters.nearbyRadiusKm}km
            </span>
          )}
        </div>
      )}

      {/* Nearby Search */}
      <div className={`apple-glass-panel rounded-2xl p-4 ${localFilters.nearbyEnabled ? "ring-1 ring-emerald-400/30" : ""}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${localFilters.nearbyEnabled ? "bg-emerald-100/80 text-emerald-700" : "bg-orange-100/80 text-orange-700"}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold home-text-primary">{t("filters.searchNearby")}</span>
          </div>
          {localFilters.nearbyEnabled && (
            <button onClick={handleClearNearby}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:opacity-70 transition">
              <X className="w-3 h-3" /> {t("filters.off")}
            </button>
          )}
        </div>

        {!localFilters.nearbyEnabled ? (
          <button onClick={handleGetLocation} disabled={gettingLocation}
            className="apple-glass-panel interactive w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[var(--home-charcoal)] transition hover:opacity-90 disabled:opacity-60">
            {gettingLocation ? (
              <><span className="w-4 h-4 border-2 border-[var(--home-charcoal)] border-t-transparent rounded-full animate-spin" /> {t("filters.gettingLocation")}</>
            ) : (
              <><Navigation className="w-4 h-4" /> {t("filters.useLocation")}</>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 px-3 py-2">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">{t("filters.locationFound")}</span>
            </div>
            <p className="text-sm font-bold home-text-primary">{t("filters.radius")}: {localFilters.nearbyRadiusKm}km</p>
            <div className="flex flex-wrap gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button key={r} onClick={() => setLocalFilters({ ...localFilters, nearbyRadiusKm: r })}
                  className={`apple-glass-panel interactive rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    localFilters.nearbyRadiusKm === r
                      ? "ring-1 ring-emerald-400/40 bg-emerald-50/50 text-emerald-700"
                      : "home-text-muted"
                  }`}>
                  {r}km
                </button>
              ))}
            </div>
          </div>
        )}

        {locationError && (
          <p className="mt-2 text-xs text-red-600 font-medium">{locationError}</p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold home-text-primary mb-3">{t("filters.priceRange")}</h3>
        <input
          type="range"
          min={0}
          max={50000000}
          step={1000000}
          value={localFilters.priceRange[1]}
          onChange={(e) => setLocalFilters({ ...localFilters, priceRange: [localFilters.priceRange[0], Number(e.target.value)] })}
          className="w-full accent-[var(--home-accent-strong)]"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs home-text-muted font-medium">{(localFilters.priceRange[0] / 1000000).toFixed(0)}M</span>
          <span className="text-xs font-bold home-text-primary">{(localFilters.priceRange[1] / 1000000).toFixed(0)}M</span>
        </div>
      </div>

      {/* Property Types */}
      <div>
        <h3 className="text-sm font-bold home-text-primary mb-3">{t("filters.propertyType")}</h3>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((type) => {
            const TypeIcon = type.icon;
            return (
              <button key={type.value} onClick={() => toggleType(type.value)}
                className={`apple-glass-panel interactive rounded-2xl p-3 text-left transition-all duration-200 ${
                  isTypeSelected(type.value)
                    ? "ring-2 ring-[var(--home-accent-strong)]/50 bg-orange-50/50"
                    : ""
                }`}>
                <div className={`w-9 h-9 rounded-xl ${type.color} flex items-center justify-center mb-2`}>
                  <TypeIcon className="w-4.5 h-4.5" />
                </div>
                <p className={`text-sm ${isTypeSelected(type.value) ? "font-bold home-text-primary" : "font-semibold home-text-muted"}`}>
                  {t(type.labelKey)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <h3 className="text-sm font-bold home-text-primary mb-3">{t("filters.bedrooms")}</h3>
        <div className="flex gap-1.5">
          {BEDROOM_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setLocalFilters({ ...localFilters, bedrooms: opt.value })}
              className={`apple-glass-panel interactive flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                localFilters.bedrooms === opt.value
                  ? "ring-2 ring-[var(--home-accent-strong)]/50 bg-orange-50/50 home-text-primary font-bold"
                  : "home-text-muted"
              }`}>
              {opt.labelKey ? t(opt.labelKey) : opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <h3 className="text-sm font-bold home-text-primary mb-3">{t("filters.bathrooms")}</h3>
        <div className="flex gap-1.5">
          {BATHROOM_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setLocalFilters({ ...localFilters, bathrooms: opt.value })}
              className={`apple-glass-panel interactive flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                localFilters.bathrooms === opt.value
                  ? "ring-2 ring-[var(--home-accent-strong)]/50 bg-orange-50/50 home-text-primary font-bold"
                  : "home-text-muted"
              }`}>
              {opt.labelKey ? t(opt.labelKey) : opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersContentSection;
