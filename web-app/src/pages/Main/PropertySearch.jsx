// src/pages/PropertySearch/PropertySearch.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

// Components
import StickyHeader from "../../components/layout/layoutHome/StickyHeader";
import PropertyListView from "../../components/PropertySearch/PropertyListView";
import PropertyMapView from "../../components/PropertySearch/PropertyMapView";
import Footer from "../../components/layout/layoutHome/Footer";
import { useTranslation } from "react-i18next";
// Services
import { getAllProperties } from "../../services/property.service";

// Vietnam provinces geocoding data
const PROVINCE_COORDINATES = {
  "Hồ Chí Minh": { lat: 10.8231, lng: 106.6297, zoom: 12 },
  "TP. Hồ Chí Minh": { lat: 10.8231, lng: 106.6297, zoom: 12 },
  "Hà Nội": { lat: 21.0285, lng: 105.8542, zoom: 12 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022, zoom: 13 },
  "Cần Thơ": { lat: 10.0452, lng: 105.7469, zoom: 13 },
  "Hải Phòng": { lat: 20.8449, lng: 106.6881, zoom: 12 },
  "Biên Hòa": { lat: 10.9468, lng: 106.8232, zoom: 13 },
  "Nha Trang": { lat: 12.2388, lng: 109.1967, zoom: 13 },
  Huế: { lat: 16.4637, lng: 107.5909, zoom: 13 },
  "Vũng Tàu": { lat: 10.346, lng: 107.0844, zoom: 13 },
};

const PropertySearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [allProperties, setAllProperties] = useState([]); // All loaded properties
  const [baseFilteredProperties, setBaseFilteredProperties] = useState([]); // After URL + drawer filters
  const [displayedProperties, setDisplayedProperties] = useState([]); // After map bounds filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [initialZoom, setInitialZoom] = useState(12);
  const { t } = useTranslation();
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Search criteria from URL
  const [searchCriteria, setSearchCriteria] = useState({
    location: "",
    propertyType: "",
    minPrice: 0,
    maxPrice: 50000000,
  });

  // Filters
  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    propertyTypes: [],
    bedrooms: 0,
    bathrooms: 0,
  });

  // Extract search params from URL
  useEffect(() => {
    const location = searchParams.get("location") || "";
    const type = searchParams.get("type") || "";
    const minPrice = parseInt(searchParams.get("minPrice")) || 0;
    const maxPrice = parseInt(searchParams.get("maxPrice")) || 50000000;

    console.log("🔍 URL Search Params:", {
      location,
      type,
      minPrice,
      maxPrice,
    });

    setSearchCriteria({ location, propertyType: type, minPrice, maxPrice });

    // Update filters from URL params
    setFilters((prev) => ({
      ...prev,
      priceRange: [minPrice, maxPrice],
      propertyTypes: type ? [type] : [],
    }));

    // Set map center based on location
    if (location) {
      const cityName = location.split(",").pop().trim();
      const coords =
        PROVINCE_COORDINATES[cityName] || PROVINCE_COORDINATES["Hồ Chí Minh"];
      setMapCenter({ lat: coords.lat, lng: coords.lng });
      setInitialZoom(coords.zoom);
      console.log("📍 Map Center:", cityName, coords);
    }
  }, [searchParams]);

  // Load properties
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Loading all properties...");
      const response = await getAllProperties({ page: 0, size: 200 });

      const fetchedProperties =
        response?.result?.content ||
        response?.data?.result?.content ||
        response?.result ||
        [];

      console.log(`📍 Loaded ${fetchedProperties.length} total properties`);
      setAllProperties(fetchedProperties);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError(t("propertySearch.loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Apply base filters (URL + drawer filters)
  useEffect(() => {
    let filtered = [...allProperties];

    // Filter by location (from URL search)
    if (searchCriteria.location) {
      const searchLocation = searchCriteria.location.toLowerCase();
      filtered = filtered.filter((p) => {
        const propertyLocation = `${p.address?.district || ""}, ${
          p.address?.province || ""
        }`.toLowerCase();
        return propertyLocation.includes(searchLocation);
      });
      console.log(
        `📍 Location filter: "${searchCriteria.location}" → ${filtered.length} results`
      );
    }

    // Filter by property type (from URL search)
    if (searchCriteria.propertyType) {
      filtered = filtered.filter(
        (p) => p.propertyType === searchCriteria.propertyType
      );
      console.log(
        `🏠 Type filter: "${searchCriteria.propertyType}" → ${filtered.length} results`
      );
    }

    // Filter by price range (from URL search or filters)
    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) =>
          p.monthlyRent >= filters.priceRange[0] &&
          p.monthlyRent <= filters.priceRange[1]
      );
      console.log(
        `💰 Price filter: ${filters.priceRange[0].toLocaleString()}-${filters.priceRange[1].toLocaleString()} → ${
          filtered.length
        } results`
      );
    }

    // Filter by property types (from filter drawer - multiple selection)
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter((p) =>
        filters.propertyTypes.includes(p.propertyType)
      );
      console.log(
        `🏘️ Types filter: ${filters.propertyTypes.join(", ")} → ${
          filtered.length
        } results`
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms > 0) {
      filtered = filtered.filter((p) => {
        if (filters.bedrooms === 4) return p.bedrooms >= 4;
        return p.bedrooms === filters.bedrooms;
      });
      console.log(
        `🛏️ Bedrooms filter: ${filters.bedrooms} → ${filtered.length} results`
      );
    }

    // Filter by bathrooms
    if (filters.bathrooms > 0) {
      filtered = filtered.filter((p) => {
        if (filters.bathrooms === 3) return p.bathrooms >= 3;
        return p.bathrooms === filters.bathrooms;
      });
      console.log(
        `🚿 Bathrooms filter: ${filters.bathrooms} → ${filtered.length} results`
      );
    }

    console.log(`📊 BASE FILTERED: ${filtered.length} properties`);
    setBaseFilteredProperties(filtered);
  }, [allProperties, filters, searchCriteria]);

  // Apply map bounds filter on top of base filters
  useEffect(() => {
    if (!mapBounds) {
      // No bounds set yet, show all base filtered
      console.log(
        `🗺️ No bounds filter - showing all ${baseFilteredProperties.length} properties`
      );
      setDisplayedProperties(baseFilteredProperties);
      return;
    }

    // Filter by map bounds
    const boundsFiltered = baseFilteredProperties.filter((p) => {
      if (!p.address?.location) return false;

      const [lat, lng] = p.address.location
        .split(",")
        .map((v) => parseFloat(v.trim()));

      if (isNaN(lat) || isNaN(lng)) return false;

      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lng >= mapBounds.west &&
        lng <= mapBounds.east
      );
    });

    console.log(
      `🗺️ Map bounds filter: ${boundsFiltered.length} properties in view (from ${baseFilteredProperties.length} base filtered)`
    );

    setDisplayedProperties(boundsFiltered);
    setCurrentPage(1); // Reset to first page when bounds change
  }, [baseFilteredProperties, mapBounds]);

  // Calculate filter count
  const getFilterCount = () => {
    let count = 0;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.bedrooms > 0) count++;
    if (filters.bathrooms > 0) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000000) {
      count++;
    }
    return count;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = displayedProperties.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(displayedProperties.length / itemsPerPage);

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBoundsChange = useCallback((bounds) => {
    console.log("🗺️ Bounds changed:", bounds);
    setMapBounds(bounds);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      {/* Main Header - Always Compact Mode with Filters */}
      <StickyHeader
        forceCompact={true}
        showFilters={true}
        filters={filters}
        onFilterChange={handleFilterChange}
        filterCount={getFilterCount()}
      />

      {/* Search Bar - Removed since filters are now in header */}

      {/* Results Count */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "grey.200",
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box>
            <Typography variant="body2" sx={{ color: "grey.600" }}>
              {loading
                ? t("propertySearch.loading")
                : `${displayedProperties.length} ${t("propertySearch.places")}${
                    mapBounds ? ` ${t("propertySearch.inArea")}` : ""
                  }${
                    totalPages > 1
                      ? ` · ${t(
                          "propertySearch.page"
                        )} ${currentPage}/${totalPages}`
                      : ""
                  }`}
            </Typography>
            {searchCriteria.location && (
              <Typography
                variant="body2"
                sx={{ color: "primary.main", fontWeight: 600, mt: 0.5 }}
              >
                📍 {t("propertySearch.searchResultAt")}:{" "}
                {searchCriteria.location}
              </Typography>
            )}
            {/* {mapBounds &&
              baseFilteredProperties.length !== displayedProperties.length && (
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500", display: "block", mt: 0.5 }}
                >
                  🗺️ Hiển thị {displayedProperties.length} /{" "}
                  {baseFilteredProperties.length} bất động sản (lọc theo bản đồ)
                </Typography>
              )} */}
          </Box>
        </Container>
      </Box>

      {/* Main Content - Split View */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          minHeight: "calc(100vh - 240px)",
        }}
      >
        {/* Left: Property List */}
        <Box
          sx={{
            bgcolor: "white",
            borderRight: { xs: "none", lg: "1px solid" },
            borderColor: "grey.200",
            overflowY: "auto",
            maxHeight: { lg: "calc(100vh - 240px)" },
          }}
        >
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: "error.50",
                  border: "1px solid",
                  borderColor: "error.200",
                  borderRadius: 2,
                  color: "error.700",
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}

            <PropertyListView
              properties={currentProperties}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onPropertyHover={setHoveredPropertyId}
              onPropertyClick={handlePropertyClick}
            />
          </Container>
        </Box>

        {/* Right: Map - Always visible on desktop */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "sticky",
            top: 153,
            height: "calc(100vh - 240px)",
          }}
        >
          <PropertyMapView
            properties={displayedProperties}
            hoveredPropertyId={hoveredPropertyId}
            onPropertyClick={handlePropertyClick}
            onBoundsChange={handleBoundsChange}
            initialCenter={mapCenter}
            initialZoom={initialZoom}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default PropertySearch;
