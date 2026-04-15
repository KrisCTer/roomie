import React from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { PROPERTY_TYPES } from "../utils/homePresentation";

const HomeHeroSection = ({
  searchData,
  setSearchData,
  handleSearch,
  totalProperties,
  availableAreas,
  t,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[var(--home-border)]">
      <div className="home-hero-pattern" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="reveal-item lg:col-span-8">
          <p className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--home-border-strong)] bg-white px-4 text-sm font-semibold text-[var(--home-charcoal)]">
            <Sparkles size={16} className="text-[var(--home-accent-strong)]" />
            {t("home.heroTagline")}
          </p>
          <h1 className="home-headline">
            {t("home.heroTitle1")}
            <span className="block">{t("home.heroTitle2")}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--home-muted)] sm:text-lg">
            {t("home.exploreThousands")}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <p className="home-kpi-card reveal-item">
              <span>{totalProperties.toLocaleString()}</span>
              {t("home.listingsOpen")}
            </p>
            <p className="home-kpi-card reveal-item">
              <span>{availableAreas.toLocaleString()}</span>
              {t("home.activeAreas")}
            </p>
            <p className="home-kpi-card reveal-item">
              <span>24h</span>
              {t("home.latestUpdate")}
            </p>
          </div>
        </div>

        <aside className="reveal-item lg:col-span-4">
          <div className="home-search-panel">
            <h2 className="text-xl font-semibold text-[var(--home-charcoal)]">
              {t("home.searchByArea")}
            </h2>
            <label
              className="mt-4 block text-sm font-medium"
              htmlFor="home-location"
            >
              {t("home.location")}
            </label>
            <div className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-[var(--home-border)] bg-white px-3">
              <MapPin size={17} className="text-[var(--home-muted)]" />
              <input
                id="home-location"
                value={searchData.location}
                onChange={(event) =>
                  setSearchData((prev) => ({
                    ...prev,
                    location: event.target.value,
                  }))
                }
                placeholder={t("home.locationPlaceholder")}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--home-muted)]"
                aria-label="Search location"
              />
            </div>

            <label
              className="mt-4 block text-sm font-medium"
              htmlFor="home-type"
            >
              {t("home.propertyTypeLabel")}
            </label>
            <select
              id="home-type"
              value={searchData.propertyType}
              onChange={(event) =>
                setSearchData((prev) => ({
                  ...prev,
                  propertyType: event.target.value,
                }))
              }
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--home-border)] bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type || "all"} value={type}>
                  {type ? t(`home.propertyType.${type}`) : t("home.allTypes")}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <input
                inputMode="numeric"
                value={searchData.minPrice}
                onChange={(event) =>
                  setSearchData((prev) => ({
                    ...prev,
                    minPrice: event.target.value,
                  }))
                }
                placeholder={t("home.minPrice")}
                className="home-input"
                aria-label="Minimum price"
              />
              <input
                inputMode="numeric"
                value={searchData.maxPrice}
                onChange={(event) =>
                  setSearchData((prev) => ({
                    ...prev,
                    maxPrice: event.target.value,
                  }))
                }
                placeholder={t("home.maxPrice")}
                className="home-input"
                aria-label="Maximum price"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--home-charcoal)] text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
            >
              <Search size={16} />
              {t("home.openSearch")}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default HomeHeroSection;
