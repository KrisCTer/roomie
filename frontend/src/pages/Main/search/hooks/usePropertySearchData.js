import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getAllProperties, searchNearbyProperties } from "../../../../services/propertyService";
import {
  DEFAULT_FILTERS,
  DEFAULT_SEARCH_CRITERIA,
  PROVINCE_COORDINATES,
  getActiveFilterCount,
} from "../utils/searchPresentation";

const AVAILABLE_STATUSES = new Set(["AVAILABLE", "PUBLISHED", "VACANT"]);

const isPropertyAvailable = (property) => {
  const status = (
    property?.propertyStatus ||
    property?.status ||
    ""
  )
    .toString()
    .toUpperCase();

  if (status) {
    return AVAILABLE_STATUSES.has(status);
  }

  if (typeof property?.isAvailable === "boolean") {
    return property.isAvailable;
  }

  if (typeof property?.isRented === "boolean") {
    return !property.isRented;
  }

  return true;
};

const usePropertySearchData = ({ searchParams, t, isDesktop, navigate }) => {
  const [allProperties, setAllProperties] = useState([]);
  const [baseFilteredProperties, setBaseFilteredProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapInitialBoundsReady, setMapInitialBoundsReady] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [initialZoom, setInitialZoom] = useState(12);

  const [currentPage, setCurrentPage] = useState(1);
  const [mobileView, setMobileView] = useState("list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchCriteria, setSearchCriteria] = useState(DEFAULT_SEARCH_CRITERIA);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Distance map: propertyId -> distanceKm (populated in nearby mode)
  const distanceMapRef = useRef(new Map());

  const itemsPerPage = 20;

  useEffect(() => {
    const location = searchParams.get("location") || "";
    const type = searchParams.get("type") || "";
    const minPrice = parseInt(searchParams.get("minPrice"), 10) || 0;
    const maxPrice = parseInt(searchParams.get("maxPrice"), 10) || 50000000;

    setSearchCriteria({ location, propertyType: type, minPrice, maxPrice });
    setMapBounds(null);
    setMapInitialBoundsReady(false);

    setFilters((prev) => ({
      ...prev,
      priceRange: [minPrice, maxPrice],
      propertyTypes: type ? [type] : [],
    }));

    if (location) {
      const cityName = location.split(",").pop().trim();
      const coords =
        PROVINCE_COORDINATES[cityName] || PROVINCE_COORDINATES["Hồ Chí Minh"];
      setMapCenter({ lat: coords.lat, lng: coords.lng });
      setInitialZoom(coords.zoom);
    }
  }, [searchParams]);

  // Load properties - switches between normal and nearby mode
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      distanceMapRef.current.clear();

      if (filters.nearbyEnabled && filters.nearbyLat && filters.nearbyLng) {
        // Nearby mode: call geo_distance API
        const response = await searchNearbyProperties({
          lat: filters.nearbyLat,
          lng: filters.nearbyLng,
          radiusKm: filters.nearbyRadiusKm,
          page: 0,
          size: 200,
        });

        const nearbyResults =
          response?.result || response?.data?.result || [];

        // Extract properties and build distance map
        const properties = nearbyResults.map((item) => {
          const prop = item.property;
          if (prop && item.distanceKm != null) {
            distanceMapRef.current.set(prop.propertyId, item.distanceKm);
          }
          return prop;
        }).filter(Boolean).filter(isPropertyAvailable);

        setAllProperties(properties);

        // Center map on user location
        setMapCenter({ lat: filters.nearbyLat, lng: filters.nearbyLng });
        setInitialZoom(14);
      } else {
        // Normal mode
        const response = await getAllProperties({ page: 0, size: 200 });

        const fetchedProperties =
          response?.result?.content ||
          response?.data?.result?.content ||
          response?.result ||
          [];

        setAllProperties(fetchedProperties.filter(isPropertyAvailable));
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError(t("propertySearch.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t, filters.nearbyEnabled, filters.nearbyLat, filters.nearbyLng, filters.nearbyRadiusKm]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    let filtered = [...allProperties];

    if (searchCriteria.location) {
      const searchLocation = searchCriteria.location.toLowerCase();
      filtered = filtered.filter((p) => {
        const propertyLocation = `${p.address?.district || ""}, ${
          p.address?.province || ""
        }`.toLowerCase();
        return propertyLocation.includes(searchLocation);
      });
    }

    if (searchCriteria.propertyType) {
      filtered = filtered.filter(
        (p) => p.propertyType === searchCriteria.propertyType,
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) =>
          p.monthlyRent >= filters.priceRange[0] &&
          p.monthlyRent <= filters.priceRange[1],
      );
    }

    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter((p) =>
        filters.propertyTypes.includes(p.propertyType),
      );
    }

    if (filters.bedrooms > 0) {
      filtered = filtered.filter((p) => {
        if (filters.bedrooms === 4) return p.bedrooms >= 4;
        return p.bedrooms === filters.bedrooms;
      });
    }

    if (filters.bathrooms > 0) {
      filtered = filtered.filter((p) => {
        if (filters.bathrooms === 3) return p.bathrooms >= 3;
        return p.bathrooms === filters.bathrooms;
      });
    }

    setBaseFilteredProperties(filtered);
  }, [allProperties, filters, searchCriteria]);

  useEffect(() => {
    // In nearby mode, skip map bounds filtering (results are already geo-filtered)
    if (filters.nearbyEnabled) {
      setDisplayedProperties(baseFilteredProperties);
      return;
    }

    if (!mapBounds) {
      setDisplayedProperties(baseFilteredProperties);
      return;
    }

    const boundsFiltered = baseFilteredProperties.filter((p) => {
      if (!p.address?.location) return false;

      const [lat, lng] = p.address.location
        .split(",")
        .map((v) => parseFloat(v.trim()));

      if (Number.isNaN(lat) || Number.isNaN(lng)) return false;

      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lng >= mapBounds.west &&
        lng <= mapBounds.east
      );
    });

    setDisplayedProperties(boundsFiltered);
    setCurrentPage(1);
  }, [baseFilteredProperties, mapBounds, filters.nearbyEnabled]);

  const filterCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

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
    setMapBounds(bounds);
    setMapInitialBoundsReady(true);
  }, []);

  const handleMapInitialBoundsReady = useCallback(() => {
    setMapInitialBoundsReady(true);
  }, []);

  const mapProperties = mapBounds
    ? displayedProperties
    : baseFilteredProperties;

  const waitingForMapSync =
    isDesktop && !loading && !error && !mapInitialBoundsReady && !filters.nearbyEnabled;
  const effectiveDisplayedProperties = waitingForMapSync
    ? []
    : displayedProperties;
  const effectiveTotalPages = Math.ceil(
    effectiveDisplayedProperties.length / itemsPerPage,
  );
  const visibleCount = effectiveDisplayedProperties.length;

  const showListPanel = isDesktop || mobileView === "list";
  const showMapPanel = isDesktop || mobileView === "map";

  return {
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
    distanceMap: distanceMapRef.current,
    nearbyEnabled: filters.nearbyEnabled,
    nearbyLat: filters.nearbyLat,
    nearbyLng: filters.nearbyLng,
    nearbyRadiusKm: filters.nearbyRadiusKm,
  };
};

export default usePropertySearchData;

