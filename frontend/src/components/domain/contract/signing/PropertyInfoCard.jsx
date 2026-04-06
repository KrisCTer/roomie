/* aria-label */
import React from "react";
import { Home, MapPin, BedDouble, Bath, Ruler } from "lucide-react";

const PropertyInfoCard = ({ property }) => {
  if (!property) {
    return (
      <div className="home-glass-card rounded-2xl p-6 border border-white/55 text-sm text-[#6E675F]">
        No property information available
      </div>
    );
  }

  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      {/* Header */}
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
        <Home className="w-6 h-6 text-[#CC6F4A]" />
        Thông tin bất động sản
      </h2>

      <div className="flex gap-4">
        {/* Image */}
        {property.mediaList?.[0]?.url && (
          <img
            src={property.mediaList[0].url}
            alt={property.title}
            className="w-28 h-28 object-cover rounded-xl flex-shrink-0 border border-white/70"
          />
        )}

        {/* Details */}
        <div className="flex-1 space-y-3 text-sm">
          {/* Name */}
          <div className="flex items-center gap-2">
            <span className="text-[#6E675F] whitespace-nowrap">Tên:</span>
            <span className="font-semibold text-[#2B2A28] truncate">
              {property.title}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-[#CC6F4A] flex-shrink-0" />
            <span className="text-[#6E675F] whitespace-nowrap">Địa chỉ:</span>
            <span className="flex items-start gap-1 font-medium text-[#2B2A28]">
              <span className="break-words">
                {property.address?.fullAddress ||
                  `${property.address?.street || ""}, ${
                    property.address?.district || ""
                  }, ${property.address?.province || ""}`}
              </span>
            </span>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 text-[#6E675F]">
            <span className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-[#CC6F4A]" />
              {property.bedrooms ?? 0} giường
            </span>

            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-[#CC6F4A]" />
              {property.bathrooms ?? 0} phòng tắm
            </span>

            <span className="flex items-center gap-1">
              <Ruler className="w-4 h-4 text-[#CC6F4A]" />
              {property.size ?? 0} m²
            </span>
          </div>

          {/* Monthly Rent */}
          <div className="flex items-center gap-2">
            <span className="text-[#6E675F] whitespace-nowrap">
              Tiền thuê hàng tháng:
            </span>
            <span className="font-bold text-[#CC6F4A] text-lg">
              {new Intl.NumberFormat("vi-VN").format(property.monthlyRent || 0)}{" "}
              ₫ / tháng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
