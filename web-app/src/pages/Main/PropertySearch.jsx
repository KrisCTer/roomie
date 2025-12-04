import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Map,
  Grid3x3,
} from "lucide-react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../../components/layout/layoutHome/Header";
import Footer from "../../components/layout/layoutHome/Footer";

// Mock PropertyCard component
const PropertyCard = ({ property, onHover }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => onHover?.(property.propertyId)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-square">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform"
        >
          <svg
            className={`w-6 h-6 ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "fill-white/70 text-white/70"
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        {property.isFeatured && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold">
            Được khách yêu thích
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900">{property.title}</h3>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold">★ {property.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{property.description}</p>
        <div className="pt-1">
          <span className="font-semibold text-gray-900">
            ₫{property.monthlyRent.toLocaleString()}
          </span>
          <span className="text-gray-600 text-sm">
            {" "}
            /{property.pricePostfix}
          </span>
        </div>
      </div>
    </div>
  );
};

// Generate mock properties with coordinates
const generatePropertiesInBounds = (bounds, count = 20) => {
  const properties = [];
  const { north, south, east, west } = bounds;

  const templates = [
    {
      type: "APARTMENT",
      title: "Căn hộ hiện đại",
      desc: "Căn hộ đầy đủ tiện nghi",
    },
    {
      type: "CONDO",
      title: "Chung cư cao cấp",
      desc: "View đẹp, an ninh 24/7",
    },
    { type: "HOUSE", title: "Nhà nguyên căn", desc: "Không gian rộng rãi" },
  ];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const lat = south + Math.random() * (north - south);
    const lng = west + Math.random() * (east - west);

    properties.push({
      propertyId: `prop-${Date.now()}-${i}`,
      title: template.title,
      description: template.desc,
      monthlyRent: Math.floor(1500 + Math.random() * 3000),
      pricePostfix: "tháng",
      propertyType: template.type,
      bedrooms: Math.floor(1 + Math.random() * 3),
      bathrooms: Math.floor(1 + Math.random() * 2),
      rating: (4 + Math.random()).toFixed(2),
      reviews: Math.floor(5 + Math.random() * 50),
      imageUrl: `https://images.unsplash.com/photo-${1560448204 + i}?w=400`,
      isFeatured: Math.random() > 0.7,
      lat,
      lng,
    });
  }

  return properties;
};

// Custom price marker component
const PriceMarker = ({ position, price, isHovered, onClick, propertyId }) => {
  const map = useMap();

  useEffect(() => {
    const priceMarker = L.divIcon({
      className: "custom-price-marker",
      html: `
        <div class="price-bubble ${isHovered ? "hovered" : ""}" style="
          background: ${isHovered ? "#1e293b" : "white"};
          color: ${isHovered ? "white" : "#1e293b"};
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          transform: ${isHovered ? "scale(1.1)" : "scale(1)"};
          border: ${isHovered ? "2px solid white" : "1px solid #e5e7eb"};
        ">
          ₫${price.toLocaleString()}
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 15],
    });

    const marker = L.marker(position, { icon: priceMarker })
      .addTo(map)
      .on("click", onClick);

    return () => {
      map.removeLayer(marker);
    };
  }, [map, position, price, isHovered, onClick]);

  return null;
};

// Map events handler
const MapEventsHandler = ({ onBoundsChange, onZoomChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  return null;
};

// Search button on map
const MapSearchButton = ({ onClick, visible }) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center gap-2"
    >
      <Search className="w-4 h-4" />
      <span className="text-sm font-medium">Tìm kiếm khu vực này</span>
    </button>
  );
};

const PropertySearch = () => {
  const [showMap, setShowMap] = useState(false);
  const [properties, setProperties] = useState([]);
  const [mapBounds, setMapBounds] = useState({
    north: 10.8231,
    south: 10.7231,
    east: 106.7298,
    west: 106.6298,
  });
  const [zoom, setZoom] = useState(13);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Initial load
  useEffect(() => {
    const initialProperties = generatePropertiesInBounds(mapBounds, 30);
    setProperties(initialProperties);
  }, []);

  // Handle map bounds change
  const handleBoundsChange = (newBounds) => {
    setMapBounds(newBounds);
    setShowSearchButton(true);
  };

  // Search in new area
  const handleSearchArea = () => {
    const newProperties = generatePropertiesInBounds(
      mapBounds,
      Math.floor(20 + Math.random() * 20)
    );
    setProperties(newProperties);
    setShowSearchButton(false);
    setCurrentPage(1);
  };

  // Handle zoom change - load more or less properties
  const handleZoomChange = (newZoom) => {
    if (Math.abs(newZoom - zoom) >= 2) {
      const count = newZoom > 14 ? 40 : newZoom > 12 ? 30 : 20;
      const newProperties = generatePropertiesInBounds(mapBounds, count);
      setProperties(newProperties);
    }
    setZoom(newZoom);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = properties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(properties.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Search Bar */}
          <div className="border-b bg-white sticky top-[73px] z-40">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white border rounded-full px-6 py-3 shadow-md hover:shadow-lg transition">
                  <div className="flex-1 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <input
                      type="text"
                      placeholder="Chỉ định bất kỳ vị trí nào"
                      className="flex-1 outline-none text-sm"
                    />
                  </div>
                  <div className="hidden lg:block h-8 w-px bg-gray-300" />
                  <div className="hidden lg:flex items-center gap-2 px-3">
                    <input
                      type="text"
                      placeholder="Tuần bất kỳ"
                      className="w-24 outline-none text-sm"
                    />
                  </div>
                  <div className="hidden lg:block h-8 w-px bg-gray-300" />
                  <div className="hidden lg:flex items-center gap-2 px-3">
                    <input
                      type="text"
                      placeholder="Thêm khách"
                      className="w-24 outline-none text-sm"
                    />
                  </div>
                  <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-full"
                >
                  {showMap ? (
                    <Grid3x3 className="w-4 h-4" />
                  ) : (
                    <Map className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {showMap ? "Hiển thị lưới" : "Hiển thị bản đồ"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
            <p className="text-sm text-gray-600">
              {properties.length} chỗ ở •
              <span className="ml-2 text-gray-400">
                Zoom: {zoom} • Page: {currentPage}/{totalPages}
              </span>
            </p>
          </div>

          <div className="flex max-w-[1760px] mx-auto px-6 gap-6 relative">
            {/* Property Grid */}
            <div
              className={`flex-1 max-w-[900px] ${
                showMap ? "hidden lg:block" : ""
              }`}
            >
              <div className="pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {currentProperties.map((property) => (
                    <PropertyCard
                      key={property.propertyId}
                      property={property}
                      onHover={setHoveredPropertyId}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-full hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-full ${
                            pageNum === currentPage
                              ? "bg-gray-900 text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded-full hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Map View */}
            <div
              className={`${
                showMap ? "w-full lg:w-1/2" : "hidden lg:block lg:w-1/2"
              } sticky top-[161px] h-[calc(100vh-161px)]`}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
                <MapSearchButton
                  visible={showSearchButton}
                  onClick={handleSearchArea}
                />

                <MapContainer
                  center={[10.7731, 106.6798]}
                  zoom={zoom}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapEventsHandler
                    onBoundsChange={handleBoundsChange}
                    onZoomChange={handleZoomChange}
                  />

                  {properties.map((property) => (
                    <PriceMarker
                      key={property.propertyId}
                      position={[property.lat, property.lng]}
                      price={property.monthlyRent}
                      propertyId={property.propertyId}
                      isHovered={hoveredPropertyId === property.propertyId}
                      onClick={() =>
                        console.log("Clicked property:", property.propertyId)
                      }
                    />
                  ))}
                </MapContainer>

                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
                  <button
                    onClick={() => {
                      const mapEl =
                        document.querySelector(".leaflet-container");
                      if (mapEl && mapEl._leaflet_map) {
                        mapEl._leaflet_map.zoomIn();
                      }
                    }}
                    className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 font-bold text-lg"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      const mapEl =
                        document.querySelector(".leaflet-container");
                      if (mapEl && mapEl._leaflet_map) {
                        mapEl._leaflet_map.zoomOut();
                      }
                    }}
                    className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 font-bold text-lg"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default PropertySearch;
