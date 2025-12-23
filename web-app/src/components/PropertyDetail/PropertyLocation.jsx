import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const PropertyLocation = ({ address }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);

  // ✅ Hooks LUÔN được gọi
  useEffect(() => {
    if (!address?.location) return;

    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`;
    script.async = true;
    console.log("MAP KEY:", process.env.REACT_APP_GOOGLE_MAPS_KEY);

    script.onload = () => {
      console.log("✅ Google Maps loaded");
      setMapsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [address?.location]);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !address?.location) return;

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
  }, [mapsLoaded, address?.location]);

  // ❗ Render fallback TẠI JSX, KHÔNG return sớm
  if (!address) return null;

  return (
    <div className="pb-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">Where you'll be</h2>

      {address.fullAddress && (
        <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <MapPin className="w-5 h-5 text-gray-700 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">Full Address</div>
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
              <p className="text-xs text-gray-600">Vị trí hiển thị tương đối</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-600">No location data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyLocation;
