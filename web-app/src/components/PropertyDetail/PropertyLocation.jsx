// src/components/PropertyDetail/PropertyLocation.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";

const PropertyLocation = ({ address }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load Google Maps
  useEffect(() => {
    if (!address?.location) return;

    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`;
    script.async = true;

    script.onload = () => {
      setMapsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [address?.location]);

  // Initialize map when expanded
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !address?.location || !isExpanded)
      return;

    const [lat, lng] = address.location
      .split(",")
      .map((v) => parseFloat(v.trim()));

    if (isNaN(lat) || isNaN(lng)) return;

    const position = { lat, lng };

    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: true,
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

    class PropertyMarker extends window.google.maps.OverlayView {
      constructor(position) {
        super();
        this.position = position;
      }

      onAdd() {
        const div = document.createElement("div");
        div.style.cssText = `
            position: absolute;
            transform: translate(-50%, -100%);
            cursor: pointer;
            z-index: 1000;
        `;
        div.innerHTML = `
        <div style="
            width: 42px;
            height: 42px;
            background: #111827;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(0,0,0,0.35);
            border: 3px solid white;
        ">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            >
            <path d="M3 10.5L12 3l9 7.5"></path>
            <path d="M5 10v10h14V10"></path>
            <path d="M9 20v-6h6v6"></path>
            </svg>
        </div>
        `;

        this.div = div;
        this.getPanes().overlayMouseTarget.appendChild(div);
      }

      draw() {
        const pos = this.getProjection().fromLatLngToDivPixel(this.position);
        if (this.div) {
          this.div.style.left = `${pos.x}px`;
          this.div.style.top = `${pos.y}px`;
        }
      }

      onRemove() {
        if (this.div?.parentNode) {
          this.div.parentNode.removeChild(this.div);
          this.div = null;
        }
      }
    }

    const marker = new PropertyMarker(new window.google.maps.LatLng(lat, lng));
    marker.setMap(map);
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [mapsLoaded, address?.location, isExpanded]);

  if (!address) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg">
            <MapPin className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Where you'll be</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content - Expandable */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {address.fullAddress && (
            <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-700 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Địa chỉ đầy đủ</div>
                <div className="font-medium text-gray-900">
                  {address.fullAddress}
                </div>
              </div>
            </div>
          )}

          <div className="relative rounded-xl overflow-hidden h-96 bg-gray-100">
            {address.location ? (
              <>
                <div ref={mapRef} className="w-full h-full" />

                {!mapsLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-600 font-medium">Loading map…</p>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md">
                  <p className="text-xs text-gray-600">
                    Vị trí hiển thị tương đối
                  </p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-600">No location data</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLocation;
