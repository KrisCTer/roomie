// src/components/PropertySearch/PropertyMapView.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import { loadGoogleMaps } from "../../../utils/googleMapsLoader";
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
  directionsTarget = null,
  onClearDirections = null,
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
  const directionsRendererRef = useRef(null);
  const [directionsInfo, setDirectionsInfo] = useState(null);

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

  // Directions rendering (using free OSRM instead of paid Google Directions API)
  useEffect(() => {
    // Cleanup previous directions
    if (directionsRendererRef.current) {
      // directionsRendererRef stores { polyline, originMarker, destMarker }
      directionsRendererRef.current.polyline?.setMap(null);
      directionsRendererRef.current.originMarker?.setMap(null);
      directionsRendererRef.current.destMarker?.setMap(null);
      directionsRendererRef.current = null;
    }
    setDirectionsInfo(null);

    if (!map || !window.google || !directionsTarget) return;

    let cancelled = false;

    const renderRoute = async (originLat, originLng) => {
      try {
        // OSRM free routing API — returns real road-following geometry
        const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${directionsTarget.lng},${directionsTarget.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled || !data.routes?.[0]) return;

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(
          ([lng, lat]) => new window.google.maps.LatLng(lat, lng)
        );

        // Draw the route polyline
        const polyline = new window.google.maps.Polyline({
          path: coords,
          strokeColor: "#059669",
          strokeWeight: 5,
          strokeOpacity: 0.9,
          map,
        });

        // Origin marker (blue dot)
        const originMarker = new window.google.maps.Marker({
          position: { lat: originLat, lng: originLng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#2563EB",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
          title: "Vị trí của bạn",
          zIndex: 1001,
        });

        // Destination marker (green)
        const destMarker = new window.google.maps.Marker({
          position: { lat: directionsTarget.lat, lng: directionsTarget.lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#059669",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
          title: "Điểm đến",
          zIndex: 1001,
        });

        directionsRendererRef.current = { polyline, originMarker, destMarker };

        // Fit map to show the full route
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: originLat, lng: originLng });
        bounds.extend({ lat: directionsTarget.lat, lng: directionsTarget.lng });
        map.fitBounds(bounds, 60);

        // Distance & duration
        const distKm = (route.distance / 1000).toFixed(1);
        const durMin = Math.round(route.duration / 60);
        setDirectionsInfo({
          distance: `${distKm} km`,
          duration: `${durMin} phút`,
        });
      } catch (err) {
        console.error("OSRM routing failed:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => renderRoute(pos.coords.latitude, pos.coords.longitude),
        () => {
          const center = map.getCenter();
          if (center) renderRoute(center.lat(), center.lng());
        },
        { timeout: 5000 }
      );
    } else {
      const center = map.getCenter();
      if (center) renderRoute(center.lat(), center.lng());
    }

    return () => {
      cancelled = true;
      if (directionsRendererRef.current) {
        directionsRendererRef.current.polyline?.setMap(null);
        directionsRendererRef.current.originMarker?.setMap(null);
        directionsRendererRef.current.destMarker?.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [map, directionsTarget]);

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

      {/* Directions info overlay */}
      {directionsTarget && directionsInfo && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            zIndex: 30,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "#ECFDF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Box component="span" sx={{ color: "#059669", fontSize: 18 }}>🧭</Box>
            </Box>
            <Box>
              <Box sx={{ fontWeight: 700, fontSize: 14, color: "#1F2937" }}>
                {directionsInfo.distance}
              </Box>
              <Box sx={{ fontSize: 12, color: "#6B7280" }}>
                Khoảng {directionsInfo.duration}
              </Box>
            </Box>
          </Box>
          <Box
            component="button"
            onClick={onClearDirections}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              bgcolor: "white",
              color: "#6B7280",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { bgcolor: "#F9FAFB", color: "#1F2937" },
            }}
          >
            Đóng
          </Box>
        </Box>
      )}

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
