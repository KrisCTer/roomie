import React, { useRef, useEffect } from "react";
import { MapPin, MapIcon } from "lucide-react";

const GoogleMapPicker = ({
  mapsLoaded,
  location,
  onLocationChange,
  error,
  setError,
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [gettingLocation, setGettingLocation] = React.useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Default to Bien Hoa, Dong Nai
      const defaultCenter = { lat: 10.9447, lng: 106.8392 };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = mapInstance;

      // Add click listener to map
      mapInstance.addListener("click", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateMapMarker(lat, lng);
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        map: mapInstance,
        draggable: true,
        position: defaultCenter,
        title: "Drag me to select location",
      });

      markerRef.current = marker;

      // Add drag listener to marker
      marker.addListener("dragend", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateLocation(lat, lng);
      });

      // Set initial location if exists
      if (location) {
        const [lat, lng] = location.split(",").map((v) => parseFloat(v.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          updateMapMarker(lat, lng);
        }
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please refresh the page.");
    }
  }, [mapsLoaded]);

  const updateMapMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
    }
    updateLocation(lat, lng);
  };

  const updateLocation = (lat, lng) => {
    const locationStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    onLocationChange(locationStr);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        updateMapMarker(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(15);
        }

        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to get your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
        }

        setError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">
          <MapIcon className="w-4 h-4 inline mr-1" />
          Select Location on Map (Click or Drag Marker)
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation || !mapsLoaded}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {gettingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Use My Location
            </>
          )}
        </button>
      </div>
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "400px",
            minHeight: "400px",
          }}
        />
      </div>
      {!mapsLoaded && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Loading map...
        </div>
      )}
      {location && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <strong>Selected coordinates:</strong>
            <code className="ml-2 bg-white px-2 py-1 rounded">{location}</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;
