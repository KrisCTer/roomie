import React from "react";
import { MapPin, Heart, Share2 } from "lucide-react";

const PropertyHeader = ({ property, isFavorite, onToggleFavorite }) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: "Xem phòng trọ này trên Roomie!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép liên kết!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-300";
      case "RENTED":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "Còn trống";
      case "RENTED":
        return "Đã cho thuê";
      default:
        return "Đang chờ";
    }
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      ROOM: "Phòng trọ",
      APARTMENT: "Căn hộ",
      HOUSE: "Nhà nguyên căn",
      VILLA: "Biệt thự",
    };
    return types[type] || type;
  };

  return (
    <div className="pb-6 border-b border-gray-200">
      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        {property.title}
      </h1>

      {/* Info Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side - Location & Tags */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              {property.address?.fullAddress ||
                `${property.address?.district}, ${property.address?.province}` ||
                "Chưa có địa chỉ"}
            </span>
          </div>

          {/* Divider */}
          <span className="text-gray-300">|</span>

          {/* Property Type Badge */}
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm border border-blue-300">
            {getPropertyTypeLabel(property.propertyType)}
          </span>

          {/* Property Label */}
          {property.propertyLabel && property.propertyLabel !== "NONE" && (
            <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg font-semibold text-sm border border-rose-300">
              {property.propertyLabel}
            </span>
          )}

          {/* Status Badge */}
          <span
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm border ${getStatusColor(
              property.propertyStatus
            )}`}
          >
            {getStatusLabel(property.propertyStatus)}
          </span>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold border border-gray-300"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia sẻ</span>
          </button>

          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold border ${
              isFavorite
                ? "bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-rose-600 text-rose-600" : "text-gray-700"
              }`}
            />
            <span>{isFavorite ? "Đã lưu" : "Lưu"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
