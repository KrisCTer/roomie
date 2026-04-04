// src/components/PropertySearch/PropertyMapView.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import { loadGoogleMaps } from "../../utils/googleMapsLoader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const getFriendlyMapError = (error) => {
  const rawMessage = error?.message || "";
  const isAuthFailure = rawMessage.includes(
    "Google Maps authentication failed",
  );

  if (isAuthFailure) {
    return [
      "Không thể xác thực Google Maps trên mạng hiện tại.",
      "Nếu bật WARP/VPN mà chạy được thì có thể ISP hoặc DNS đang chặn Google Maps.",
      "Thử đổi DNS sang 1.1.1.1 hoặc 8.8.8.8 và tải lại trang.",
    ].join(" ");
  }

  return "Google Maps không tải được. Vui lòng kiểm tra API key, billing, HTTP referrers và kết nối mạng.";
};

const PropertyMapView = ({
  properties,
  hoveredPropertyId,
  onPropertyClick,
  onBoundsChange,
  onInitialBoundsReady,
  initialCenter = null,
  initialZoom = 12,
  nearbyEnabled = false,
  nearbyLat = null,
  nearbyLng = null,
  nearbyRadiusKm = 5,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const markersRef = useRef([]);
  const clustererRef = useRef(null);
  const isInitializedRef = useRef(false);
  const boundsChangeTimerRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const hasAutoFittedRef = useRef(false);
  const canEmitBoundsRef = useRef(false);
  const hasNotifiedInitialReadyRef = useRef(false);
  const nearbyCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  const notifyInitialBoundsReady = useCallback(() => {
    if (hasNotifiedInitialReadyRef.current) return;
    hasNotifiedInitialReadyRef.current = true;
    onInitialBoundsReady?.();
  }, [onInitialBoundsReady]);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch((error) => {
        console.error(
          "Failed to load Google Maps API:",
          error?.message || error,
        );
        setMapsError(getFriendlyMapError(error));
        notifyInitialBoundsReady();
      });
  }, [notifyInitialBoundsReady]);

  // Debounced bounds change handler
  const handleBoundsChanged = useCallback(() => {
    if (!map || !canEmitBoundsRef.current) return;

    // Clear existing timer
    if (boundsChangeTimerRef.current) {
      clearTimeout(boundsChangeTimerRef.current);
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

    const MapConstructor = window.google?.maps?.Map;
    if (typeof MapConstructor !== "function") {
      setMapsError(
        "Google Maps API không khả dụng. Vui lòng kiểm tra API key, billing và allowed HTTP referrers.",
      );
      notifyInitialBoundsReady();
      return;
    }

    const mapInstance = new MapConstructor(mapRef.current, {
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
  }, [mapsLoaded, notifyInitialBoundsReady]);

  // Add bounds listener after map is created
  useEffect(() => {
    if (!map) return;

    const listener = window.google.maps.event.addListener(
      map,
      "bounds_changed",
      handleBoundsChanged,
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
      (prop) => prop.address?.location,
    );

    if (propertiesWithLocation.length === 0) {
      canEmitBoundsRef.current = true;
      handleBoundsChanged();
      notifyInitialBoundsReady();
      return;
    }

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
    window.google.maps.event.addListenerOnce(map, "idle", () => {
      const currentZoom = map.getZoom();
      if (currentZoom > 15) {
        map.setZoom(15); // Don't zoom in too much
      }

      hasAutoFittedRef.current = true;
      canEmitBoundsRef.current = true;

      // Trigger initial bounds update
      handleBoundsChanged();
      notifyInitialBoundsReady();
    });
  }, [map, properties, handleBoundsChanged, notifyInitialBoundsReady]);

  // Update map when search location changes (optional override)
  useEffect(() => {
    if (!map || !initialCenter || !hasAutoFittedRef.current) return;

    map.panTo(initialCenter);
    map.setZoom(initialZoom);

    // Reset auto-fit flag so it can refit to new search results
    hasAutoFittedRef.current = false;
  }, [map, initialCenter, initialZoom]);

  // Update markers + cluster
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    const propertiesWithLocation = properties.filter(
      (prop) => prop.address?.location,
    );

    if (propertiesWithLocation.length === 0) {
      return;
    }

    const markers = propertiesWithLocation
      .map((prop) => {
        const [lat, lng] = prop.address.location
          .split(",")
          .map((v) => parseFloat(v.trim()));

        if (isNaN(lat) || isNaN(lng)) return null;

        const isHovered = prop.propertyId === hoveredPropertyId;
        const priceInMillions = (prop.monthlyRent / 1000000).toFixed(1);

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          label: {
            text: `${priceInMillions}tr`,
            color: isHovered ? "#FFFFFF" : "#1E293B",
            fontSize: isHovered ? "13px" : "12px",
            fontWeight: "700",
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: isHovered ? "#1E293B" : "#FFFFFF",
            fillOpacity: 1,
            strokeColor: isHovered ? "#FFFFFF" : "#E5E7EB",
            strokeWeight: isHovered ? 2 : 1,
            scale: isHovered ? 26 : 22,
          },
          zIndex: isHovered ? 1000 : 10,
        });

        marker.addListener("click", () => onPropertyClick?.(prop.propertyId));
        return marker;
      })
      .filter(Boolean);

    markersRef.current = markers;

    clustererRef.current = new MarkerClusterer({
      map,
      markers,
    });

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }

      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [map, properties, hoveredPropertyId, onPropertyClick]);

  // Nearby mode: draw circle + user marker
  useEffect(() => {
    // Cleanup previous
    if (nearbyCircleRef.current) {
      nearbyCircleRef.current.setMap(null);
      nearbyCircleRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (!map || !window.google || !nearbyEnabled || !nearbyLat || !nearbyLng) return;

    const center = { lat: nearbyLat, lng: nearbyLng };

    // Draw radius circle
    nearbyCircleRef.current = new window.google.maps.Circle({
      map,
      center,
      radius: nearbyRadiusKm * 1000,
      fillColor: "#059669",
      fillOpacity: 0.08,
      strokeColor: "#059669",
      strokeOpacity: 0.4,
      strokeWeight: 2,
      clickable: false,
    });

    // Draw user location marker
    userMarkerRef.current = new window.google.maps.Marker({
      map,
      position: center,
      title: "Vi tri cua ban",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#2563EB",
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 3,
      },
      zIndex: 999,
    });

    // Fit bounds to circle
    const circleBounds = nearbyCircleRef.current.getBounds();
    if (circleBounds) {
      map.fitBounds(circleBounds);
    }

    return () => {
      if (nearbyCircleRef.current) {
        nearbyCircleRef.current.setMap(null);
        nearbyCircleRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
  }, [map, nearbyEnabled, nearbyLat, nearbyLng, nearbyRadiusKm]);

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

      {mapsError && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.95)",
            px: 3,
            textAlign: "center",
            color: "#b91c1c",
            fontWeight: 600,
            zIndex: 20,
          }}
        >
          {mapsError}
        </Box>
      )}
    </Box>
  );
};

export default PropertyMapView;
