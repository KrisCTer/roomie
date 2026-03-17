import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchFilters from "./filters/SearchFiltersShell";
import EditorialHeader from "../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../components/layout/layoutHome/EditorialFooter";
import usePropertySearchData from "./hooks/usePropertySearchData";
import SearchHeroSection from "./sections/SearchHeroSection";
import SearchFilterBarSection from "./sections/SearchFilterBarSection";
import SearchStatusSection from "./sections/SearchStatusSection";
import SearchContentSection from "./sections/SearchContentSection";
import "../../../styles/home-redesign.css";
import "../../../styles/search-redesign.css";

const PropertySearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t } = useTranslation();

  const {
    loading,
    error,
    filters,
    filterCount,
    isFilterOpen,
    setIsFilterOpen,
    mobileView,
    setMobileView,
    searchCriteria,
    baseFilteredProperties,
    visibleCount,
    mapBounds,
    showListPanel,
    showMapPanel,
    waitingForMapSync,
    currentPage,
    effectiveTotalPages,
    indexOfFirstItem,
    indexOfLastItem,
    effectiveDisplayedProperties,
    hoveredPropertyId,
    setHoveredPropertyId,
    mapProperties,
    mapCenter,
    initialZoom,
    handleFilterChange,
    handlePageChange,
    handlePropertyClick,
    handleBoundsChange,
    handleMapInitialBoundsReady,
  } = usePropertySearchData({ searchParams, t, isDesktop, navigate });

  return (
    <Box
      className="search-v2 home-v2"
      sx={{ minHeight: "100vh", bgcolor: "var(--home-bg)" }}
    >
      <EditorialHeader />

      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <SearchHeroSection
        isDesktop={isDesktop}
        mobileView={mobileView}
        setMobileView={setMobileView}
        baseCount={baseFilteredProperties.length}
        visibleCount={visibleCount}
        mapBounds={mapBounds}
      />

      <SearchFilterBarSection
        isDesktop={isDesktop}
        filterCount={filterCount}
        mapBounds={mapBounds}
        mobileView={mobileView}
        setMobileView={setMobileView}
        onOpenFilters={() => setIsFilterOpen(true)}
      />

      <SearchStatusSection
        loading={loading}
        waitingForMapSync={waitingForMapSync}
        visibleCount={visibleCount}
        mapBounds={mapBounds}
        effectiveTotalPages={effectiveTotalPages}
        currentPage={currentPage}
        searchCriteria={searchCriteria}
        t={t}
      />

      <SearchContentSection
        showListPanel={showListPanel}
        showMapPanel={showMapPanel}
        error={error}
        effectiveDisplayedProperties={effectiveDisplayedProperties}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        loading={loading}
        waitingForMapSync={waitingForMapSync}
        currentPage={currentPage}
        effectiveTotalPages={effectiveTotalPages}
        onPageChange={handlePageChange}
        onPropertyHover={setHoveredPropertyId}
        onPropertyClick={handlePropertyClick}
        mapBounds={mapBounds}
        mapProperties={mapProperties}
        hoveredPropertyId={hoveredPropertyId}
        onBoundsChange={handleBoundsChange}
        onInitialBoundsReady={handleMapInitialBoundsReady}
        initialCenter={mapCenter}
        initialZoom={initialZoom}
      />

      <EditorialFooter description="Search mới đồng bộ visual với Home: map-list split, filter rõ ràng, và flow mobile tối ưu cho thao tác một tay." />
    </Box>
  );
};

export default PropertySearchPage;
