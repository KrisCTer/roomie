// src/components/PropertySearch/PropertyMapView.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, CircularProgress, Button } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const PropertyMapView = ({
  properties,
  hoveredPropertyId,
  onPropertyClick,
  onBoundsChange,
  initialCenter = null,
  initialZoom = 12,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const markersRef = useRef([]);
  const isInitializedRef = useRef(false);
  const boundsChangeTimerRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const hasAutoFittedRef = useRef(false); // Track if we've auto-fitted

  const [showSearchButton, setShowSearchButton] = useState(false);

  // Load Google Maps
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`;
    script.async = true;

    script.addEventListener("load", () => {
      console.log("✅ Google Maps loaded");
      setMapsLoaded(true);
    });

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Debounced bounds change handler
  const handleBoundsChanged = useCallback(() => {
    if (!map) return;

    // Clear existing timer
    if (boundsChangeTimerRef.current) {
      clearTimeout(boundsChangeTimerRef.current);
    }

    // Show search button after initial load
    if (hasAutoFittedRef.current) {
      setShowSearchButton(true);
    }

    // Debounce bounds update
    boundsChangeTimerRef.current = setTimeout(() => {
      const bounds = map.getBounds();
      if (bounds) {
        const newBounds = {
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng(),
        };

        // Only call if bounds actually changed significantly
        const boundsChanged =
          !lastBoundsRef.current ||
          Math.abs(lastBoundsRef.current.north - newBounds.north) > 0.001 ||
          Math.abs(lastBoundsRef.current.south - newBounds.south) > 0.001 ||
          Math.abs(lastBoundsRef.current.east - newBounds.east) > 0.001 ||
          Math.abs(lastBoundsRef.current.west - newBounds.west) > 0.001;

        if (boundsChanged) {
          console.log("🗺️ Map bounds changed:", newBounds);
          lastBoundsRef.current = newBounds;
          onBoundsChange?.(newBounds);
        }
      }
    }, 500);
  }, [map, onBoundsChange]);

  // Initialize map ONCE with default center
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || isInitializedRef.current) return;

    // Use a default center, but we'll auto-fit to properties later
    const center = { lat: 10.7769, lng: 106.7009 }; // Default: HCM

    console.log(`🗺️ Initializing map with default center`);

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 5, // Start zoomed out
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    setMap(mapInstance);
    isInitializedRef.current = true;
  }, [mapsLoaded]);

  // Add bounds listener after map is created
  useEffect(() => {
    if (!map) return;

    console.log("🎯 Adding bounds change listener");

    const listener = window.google.maps.event.addListener(
      map,
      "bounds_changed",
      handleBoundsChanged
    );

    return () => {
      window.google.maps.event.removeListener(listener);
      if (boundsChangeTimerRef.current) {
        clearTimeout(boundsChangeTimerRef.current);
      }
    };
  }, [map, handleBoundsChanged]);

  // Auto-fit to properties when they first load
  useEffect(() => {
    if (!map || !window.google || properties.length === 0) return;

    // Only auto-fit once when properties first load
    if (hasAutoFittedRef.current) return;

    const propertiesWithLocation = properties.filter(
      (prop) => prop.address?.location
    );

    if (propertiesWithLocation.length === 0) {
      console.log("⚠️ No properties with location data");
      return;
    }

    console.log(
      `🎯 Auto-fitting map to ${propertiesWithLocation.length} properties`
    );

    const bounds = new window.google.maps.LatLngBounds();

    propertiesWithLocation.forEach((prop) => {
      const [lat, lng] = prop.address.location
        .split(",")
        .map((v) => parseFloat(v.trim()));

      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend(new window.google.maps.LatLng(lat, lng));
      }
    });

    // Fit the map to show all properties
    map.fitBounds(bounds);

    // Add padding and limit max zoom
    const listener = window.google.maps.event.addListenerOnce(
      map,
      "idle",
      () => {
        const currentZoom = map.getZoom();
        if (currentZoom > 15) {
          map.setZoom(15); // Don't zoom in too much
        }

        console.log("✅ Map auto-fitted to properties");
        hasAutoFittedRef.current = true;

        // Trigger initial bounds update
        handleBoundsChanged();
      }
    );
  }, [map, properties, handleBoundsChanged]);

  // Update map when search location changes (optional override)
  useEffect(() => {
    if (!map || !initialCenter || !hasAutoFittedRef.current) return;

    console.log("📍 User searched for specific location:", initialCenter);
    map.panTo(initialCenter);
    map.setZoom(initialZoom);

    // Reset auto-fit flag so it can refit to new search results
    hasAutoFittedRef.current = false;
  }, [initialCenter, initialZoom]);

  // Update markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(({ overlay }) => {
      if (overlay) overlay.setMap(null);
    });
    markersRef.current = [];

    const propertiesWithLocation = properties.filter(
      (prop) => prop.address?.location
    );

    if (propertiesWithLocation.length === 0) {
      return;
    }

    console.log(`🎯 Creating ${propertiesWithLocation.length} markers`);

    propertiesWithLocation.forEach((prop) => {
      const [lat, lng] = prop.address.location
        .split(",")
        .map((v) => parseFloat(v.trim()));

      if (isNaN(lat) || isNaN(lng)) return;

      const isHovered = prop.propertyId === hoveredPropertyId;
      const priceInMillions = (prop.monthlyRent / 1000000).toFixed(1);

      class PriceOverlay extends window.google.maps.OverlayView {
        constructor(position, price, isHovered, propertyId, onClick) {
          super();
          this.position = position;
          this.price = price;
          this.isHovered = isHovered;
          this.propertyId = propertyId;
          this.onClick = onClick;
        }

        onAdd() {
          const div = document.createElement("div");
          div.style.cssText = `
            background: ${this.isHovered ? "#1e293b" : "white"};
            color: ${this.isHovered ? "white" : "#1e293b"};
            padding: 8px 14px;
            border-radius: 24px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s;
            transform: ${this.isHovered ? "scale(1.15)" : "scale(1)"};
            border: ${this.isHovered ? "2px solid white" : "1px solid #e5e7eb"};
            position: absolute;
            user-select: none;
            z-index: ${this.isHovered ? "1000" : "1"};
          `;
          div.innerHTML = `${this.price}tr`;
          div.onclick = () => this.onClick(this.propertyId);

          this.div = div;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(div);
        }

        draw() {
          const projection = this.getProjection();
          const position = projection.fromLatLngToDivPixel(this.position);
          if (this.div) {
            this.div.style.left = position.x - 45 + "px";
            this.div.style.top = position.y - 20 + "px";
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
        prop.propertyId,
        (id) => onPropertyClick?.(id)
      );

      overlay.setMap(map);
      markersRef.current.push({ overlay, propertyId: prop.propertyId });
    });

    return () => {
      markersRef.current.forEach(({ overlay }) => {
        if (overlay) overlay.setMap(null);
      });
    };
  }, [map, properties, hoveredPropertyId, onPropertyClick]);

  const handleSearchThisArea = () => {
    setShowSearchButton(false);
    console.log("🔍 Manual search triggered");
    handleBoundsChanged();
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "grey.100",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {!mapsLoaded && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <p style={{ color: "#666" }}>Đang tải bản đồ...</p>
          </Box>
        </Box>
      )}

      {/* {showSearchButton && (
        <Button
          onClick={handleSearchThisArea}
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "grey.900",
            color: "white",
            borderRadius: 999,
            px: 3,
            py: 1.5,
            fontWeight: 700,
            fontSize: "0.875rem",
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 10,
            "&:hover": {
              bgcolor: "grey.800",
            },
          }}
        >
          Tìm kiếm khu vực này
        </Button>
      )} */}
    </Box>
  );
};

export default PropertyMapView;
