import React from "react";
import { MapPin, Tag, Heart, Share2 } from "lucide-react";

const PropertyHeader = ({ property, isFavorite, onToggleFavorite }) => {
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link đã được sao chép!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-50 text-green-700 border-green-200";
      case "RENTED":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="pb-6 border-b border-gray-200">
      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
        {property.title}
      </h1>

      {/* Info Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side - Location & Tags */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium underline cursor-pointer hover:text-gray-900">
              {property.address?.fullAddress ||
                `${property.address?.district}, ${property.address?.province}` ||
                "Location not specified"}
            </span>
          </div>

          {/* Property Type Badge */}
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
            {property.propertyType}
          </span>

          {/* Property Label */}
          {property.propertyLabel && property.propertyLabel !== "NONE" && (
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-semibold">
              {property.propertyLabel}
            </span>
          )}

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full font-medium border ${getStatusColor(
              property.propertyStatus
            )}`}
          >
            {property.propertyStatus}
          </span>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm font-semibold underline"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={onToggleFavorite}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm font-semibold underline"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-700"
              }`}
            />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
