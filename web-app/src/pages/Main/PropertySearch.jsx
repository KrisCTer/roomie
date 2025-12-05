import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  Grid3x3,
  SlidersHorizontal,
  Heart,
  Star,
  X,
  Bed,
  Bath,
  Maximize,
} from "lucide-react";
import Header from "../../components/layout/layoutHome/Header";
import Footer from "../../components/layout/layoutHome/Footer";
import { getAllProperties } from "../../services/property.service";

// PropertyCard component
const PropertyCard = ({ property, onHover, onClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const originalUrl =
    property.mediaList && property.mediaList.length > 0
      ? property.mediaList[0].url
      : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
  const imageUrl = originalUrl + "?format=webp";
  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => onHover?.(property.propertyId)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(property)}
    >
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-[4/3]">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-6 h-6 ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "fill-white/70 text-white stroke-2"
            }`}
          />
        </button>
        {property.propertyLabel && property.propertyLabel !== "NONE" && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold">
            {property.propertyLabel === "HOT" && "🔥 Hot"}
            {property.propertyLabel === "NEW" && "✨ Mới"}
            {property.propertyLabel === "RECOMMENDED" && "⭐ Đề xuất"}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {property.title}
          </h3>
        </div>

        <p className="text-gray-600 text-sm line-clamp-1">
          {property.address?.district}, {property.address?.province}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-3 h-3" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.size > 0 && (
            <div className="flex items-center gap-1">
              <Maximize className="w-3 h-3" />
              <span>{property.size}m²</span>
            </div>
          )}
        </div>

        <div className="pt-1">
          <span className="font-semibold text-gray-900">
            {property.monthlyRent?.toLocaleString("vi-VN")}đ
          </span>
          <span className="text-gray-600 text-sm"> /tháng</span>
        </div>
      </div>
    </div>
  );
};

// Filter panel component
const FilterPanel = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const propertyTypes = [
    { value: "APARTMENT", label: "Căn hộ" },
    { value: "HOUSE", label: "Nhà nguyên căn" },
    { value: "VILLA", label: "Biệt thự" },
    { value: "ROOM", label: "Phòng trọ" },
    { value: "OTHER", label: "Khác" },
  ];

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end lg:items-center justify-center">
      <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full lg:w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-semibold">Bộ lọc</h3>
          <div className="w-5" />
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h4 className="font-semibold mb-4">Khoảng giá</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Tối thiểu
                </label>
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      minPrice: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Tối đa
                </label>
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value,
                    }))
                  }
                  placeholder="Không giới hạn"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Loại hình</h4>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    const newTypes = localFilters.propertyTypes.includes(
                      type.value
                    )
                      ? localFilters.propertyTypes.filter(
                          (t) => t !== type.value
                        )
                      : [...localFilters.propertyTypes, type.value];
                    setLocalFilters((prev) => ({
                      ...prev,
                      propertyTypes: newTypes,
                    }));
                  }}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition ${
                    localFilters.propertyTypes.includes(type.value)
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-900"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Phòng và giường</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Phòng ngủ
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          bedrooms: num,
                        }))
                      }
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        localFilters.bedrooms === num
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      {num === 0 ? "Bất kỳ" : num === 4 ? "4+" : num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Phòng tắm
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          bathrooms: num,
                        }))
                      }
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        localFilters.bathrooms === num
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      {num === 0 ? "Bất kỳ" : num === 3 ? "3+" : num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              setLocalFilters({
                minPrice: "",
                maxPrice: "",
                propertyTypes: [],
                bedrooms: 0,
                bathrooms: 0,
              });
            }}
            className="text-sm font-semibold underline"
          >
            Xóa tất cả
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Hiển thị kết quả
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertySearch = () => {
  const [showMap, setShowMap] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    propertyTypes: [],
    bedrooms: 0,
    bathrooms: 0,
  });

  const [searchParams, setSearchParams] = useState({
    query: "",
  });

  const [mapBounds, setMapBounds] = useState(null);

  // Load Google Maps
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", () => {
      console.log("✅ Google Maps loaded for search");
      setMapsLoaded(true);
    });

    script.addEventListener("error", () => {
      setError("Failed to load Google Maps");
    });

    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapsLoaded && mapRef.current && showMap && !map) {
      console.log("🗺️ Initializing search map");

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.7769, lng: 106.7009 }, // Ho Chi Minh City
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      setMap(mapInstance);

      // Listen to map bounds change
      mapInstance.addListener("idle", () => {
        const bounds = mapInstance.getBounds();
        if (bounds) {
          const newBounds = {
            north: bounds.getNorthEast().lat(),
            south: bounds.getSouthWest().lat(),
            east: bounds.getNorthEast().lng(),
            west: bounds.getSouthWest().lng(),
          };
          setMapBounds(newBounds);
          setShowSearchButton(true);
        }
      });
    }
  }, [mapsLoaded, showMap, map]);

  // Load properties
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: 0,
        size: 100,
      };

      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.propertyTypes.length > 0) {
        params.propertyTypes = filters.propertyTypes.join(",");
      }
      if (filters.bedrooms > 0) params.bedrooms = filters.bedrooms;
      if (filters.bathrooms > 0) params.bathrooms = filters.bathrooms;

      console.log("🔍 Loading properties with params:", params);
      const response = await getAllProperties(params);

      const fetchedProperties =
        response?.result?.content ||
        response?.data?.result?.content ||
        response?.data?.content ||
        response?.result ||
        [];

      console.log(`📍 Loaded ${fetchedProperties.length} properties`);

      // Filter by map bounds if map is active
      let filteredProperties = fetchedProperties;
      if (showMap && mapBounds) {
        filteredProperties = fetchedProperties.filter((prop) => {
          if (!prop.address?.location) return false;
          const [lat, lng] = prop.address.location
            .split(",")
            .map((v) => parseFloat(v.trim()));
          return (
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= mapBounds.south &&
            lat <= mapBounds.north &&
            lng >= mapBounds.west &&
            lng <= mapBounds.east
          );
        });
        console.log(`📍 ${filteredProperties.length} properties in map bounds`);
      }

      setProperties(filteredProperties);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError("Không thể tải danh sách bất động sản");
    } finally {
      setLoading(false);
    }
  }, [filters, showMap, mapBounds]);

  // Initial load
  useEffect(() => {
    loadProperties();
  }, []);

  // Update markers when properties or hover state changes
  useEffect(() => {
    if (!map || !showMap || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(({ overlay }) => {
      if (overlay) overlay.setMap(null);
    });
    markersRef.current = [];

    // Create price markers for properties with location
    const propertiesWithLocation = properties.filter(
      (prop) => prop.address?.location
    );

    console.log(`🎯 Creating ${propertiesWithLocation.length} markers`);

    propertiesWithLocation.forEach((prop) => {
      const [lat, lng] = prop.address.location
        .split(",")
        .map((v) => parseFloat(v.trim()));

      if (isNaN(lat) || isNaN(lng)) return;

      const isHovered = prop.propertyId === hoveredPropertyId;
      const priceInMillions = (prop.monthlyRent / 1000000).toFixed(1);

      // Create custom overlay for price marker
      class PriceOverlay extends window.google.maps.OverlayView {
        constructor(position, price, isHovered, propertyId) {
          super();
          this.position = position;
          this.price = price;
          this.isHovered = isHovered;
          this.propertyId = propertyId;
        }

        onAdd() {
          const div = document.createElement("div");
          div.style.cssText = `
            background: ${this.isHovered ? "#1e293b" : "white"};
            color: ${this.isHovered ? "white" : "#1e293b"};
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s;
            transform: ${this.isHovered ? "scale(1.1)" : "scale(1)"};
            border: ${this.isHovered ? "2px solid white" : "1px solid #e5e7eb"};
            position: absolute;
            user-select: none;
          `;
          div.innerHTML = `${this.price}tr`;
          div.onclick = () => {
            const element = document.getElementById(
              `property-${this.propertyId}`
            );
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          };

          this.div = div;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(div);
        }

        draw() {
          const projection = this.getProjection();
          const position = projection.fromLatLngToDivPixel(this.position);
          if (this.div) {
            this.div.style.left = position.x - 40 + "px";
            this.div.style.top = position.y - 15 + "px";
          }
        }

        onRemove() {
          if (this.div && this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        }
      }

      const overlay = new PriceOverlay(
        new window.google.maps.LatLng(lat, lng),
        priceInMillions,
        isHovered,
        prop.propertyId
      );

      overlay.setMap(map);
      markersRef.current.push({ overlay, propertyId: prop.propertyId });
    });

    return () => {
      markersRef.current.forEach(({ overlay }) => {
        if (overlay) overlay.setMap(null);
      });
    };
  }, [map, properties, hoveredPropertyId, showMap]);

  // Search in current map area
  const handleSearchArea = () => {
    console.log("🔍 Searching in current map area");
    loadProperties();
    setShowSearchButton(false);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = properties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Search Bar */}
          <div className="border-b bg-white sticky top-[73px] z-40">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white border-2 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition">
                  <div className="flex-1 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo địa điểm..."
                      value={searchParams.query}
                      onChange={(e) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          query: e.target.value,
                        }))
                      }
                      className="flex-1 outline-none text-sm"
                    />
                  </div>
                  <button
                    onClick={loadProperties}
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilterPanel(true)}
                    className="flex items-center gap-2 px-4 py-3 border-2 rounded-full hover:border-gray-900 transition text-sm font-medium"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                  </button>

                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-2 px-4 py-3 border-2 rounded-full hover:border-gray-900 transition text-sm font-medium"
                  >
                    {showMap ? (
                      <>
                        <Grid3x3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Danh sách</span>
                      </>
                    ) : (
                      <>
                        <MapIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Bản đồ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
            <p className="text-sm text-gray-600">
              {loading
                ? "Đang tải..."
                : `${properties.length} chỗ ở${
                    totalPages > 1
                      ? ` · Trang ${currentPage}/${totalPages}`
                      : ""
                  }`}
            </p>
          </div>

          {/* Content Area */}
          <div className="relative">
            <div
              className={`grid ${
                showMap ? "lg:grid-cols-2" : "lg:grid-cols-1"
              } transition-all duration-300`}
            >
              {/* Properties List */}
              <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div
                    className={`grid gap-6 ${
                      showMap
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                  >
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-3" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      Không tìm thấy bất động sản phù hợp
                    </p>
                    <button
                      onClick={() => {
                        setFilters({
                          minPrice: "",
                          maxPrice: "",
                          propertyTypes: [],
                          bedrooms: 0,
                          bathrooms: 0,
                        });
                        loadProperties();
                      }}
                      className="mt-4 text-blue-600 hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-6 ${
                        showMap
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      }`}
                    >
                      {currentProperties.map((property) => (
                        <div
                          key={property.propertyId}
                          id={`property-${property.propertyId}`}
                        >
                          <PropertyCard
                            property={property}
                            onHover={setHoveredPropertyId}
                            onClick={(prop) => {
                              window.location.href = `/property/${prop.propertyId}`;
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Map */}
              {showMap && (
                <div className="hidden lg:block sticky top-[153px] h-[calc(100vh-153px)]">
                  <div className="relative w-full h-full">
                    <div
                      ref={mapRef}
                      className="w-full h-full bg-gray-100"
                      style={{ minHeight: "calc(100vh - 153px)" }}
                    />
                    {!mapsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">Đang tải bản đồ...</p>
                      </div>
                    )}
                    {showSearchButton && (
                      <button
                        onClick={handleSearchArea}
                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center gap-2 z-10"
                      >
                        <Search className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Tìm kiếm khu vực này
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <FilterPanel
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            loadProperties();
          }}
          onClose={() => setShowFilterPanel(false)}
        />
      )}
    </div>
  );
};

export default PropertySearch;
