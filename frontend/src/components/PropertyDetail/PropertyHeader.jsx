import React from "react";
import { MapPin, Heart, Share2, Sparkles } from "lucide-react";

const PropertyHeader = ({
  property,
  isFavorite,
  onToggleFavorite,
  isFavorited,
  handleToggleFavorite,
  favoriteCount,
  favoriteLoading,
}) => {
  const liked = typeof isFavorited === "boolean" ? isFavorited : isFavorite;
  const onToggle = handleToggleFavorite || onToggleFavorite;

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
    <div className="mb-6 rounded-3xl border border-[#ECDCC8] bg-white/95 p-6 shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
      {/* Title */}
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9A3412]">
        <Sparkles className="h-4 w-4" />
        <span>Roomie Verified Listing</span>
      </div>

      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {property.title}
      </h1>

      {/* Info Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side - Location & Tags */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-[#CC6F4A]" />
            <span className="font-medium">
              {property.address?.fullAddress ||
                `${property.address?.district}, ${property.address?.province}` ||
                "Chưa có địa chỉ"}
            </span>
          </div>

          {/* Divider */}
          <span className="text-gray-300">|</span>

          {/* Property Type Badge */}
          <span className="px-3 py-1.5 bg-[#FFF4E8] text-[#9A3412] rounded-xl font-semibold text-sm border border-[#F5D9C4]">
            {getPropertyTypeLabel(property.propertyType)}
          </span>

          {/* Property Label */}
          {property.propertyLabel && property.propertyLabel !== "NONE" && (
            <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl font-semibold text-sm border border-rose-300">
              {property.propertyLabel}
            </span>
          )}

          {/* Status Badge */}
          <span
            className={`px-3 py-1.5 rounded-xl font-semibold text-sm border ${getStatusColor(
              property.propertyStatus,
            )}`}
          >
            {getStatusLabel(property.propertyStatus)}
          </span>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-[#FFF8F1] transition-colors text-sm font-semibold border border-[#E5D5C2]"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia sẻ</span>
          </button>

          <button
            onClick={onToggle}
            disabled={favoriteLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-semibold border ${
              liked
                ? "bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100"
                : "border-[#E5D5C2] hover:bg-[#FFF8F1]"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                liked ? "fill-rose-600 text-rose-600" : "text-gray-700"
              }`}
            />
            <span>{liked ? "Đã lưu" : "Lưu"}</span>
            {typeof favoriteCount === "number" && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs text-gray-700">
                {favoriteCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
