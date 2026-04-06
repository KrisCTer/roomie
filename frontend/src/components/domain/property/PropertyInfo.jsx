// src/components/PropertyDetail/PropertyInfo.jsx
import React, { useState } from "react";
import {
  Info,
  Calendar,
  Tag,
  CheckCircle,
  Home,
  MapPin,
  DoorOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PropertyInfo = ({ property }) => {
  const [isOpen, setIsOpen] = useState(true);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const getStatusLabel = (status) => {
    const statuses = {
      AVAILABLE: "Còn trống",
      RENTED: "Đã cho thuê",
      PENDING: "Đang chờ",
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-200";
      case "RENTED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (!property) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#ECDCC8] overflow-hidden shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
      {/* ===== Header (Clickable) ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-[#C2410C]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Thông tin chi tiết
          </h3>
        </div>

        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* ===== Content (Collapsible) ===== */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4 space-y-4">
            {/* Property Type */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">Loại hình</span>
              </div>
              <span className="px-3 py-1 bg-[#FFF4E8] text-[#9A3412] text-sm font-semibold rounded-lg border border-[#F5D9C4]">
                {getPropertyTypeLabel(property.propertyType)}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">Trạng thái</span>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-lg border ${getStatusColor(
                  property.propertyStatus,
                )}`}
              >
                {getStatusLabel(property.propertyStatus)}
              </span>
            </div>

            {/* Property Label */}
            {property.propertyLabel && property.propertyLabel !== "NONE" && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    Nhãn đặc biệt
                  </span>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 text-sm font-semibold rounded-lg border border-rose-200">
                  {property.propertyLabel}
                </span>
              </div>
            )}

            {/* Rooms */}
            {property.rooms && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <DoorOpen className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">Số phòng</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {property.rooms} phòng
                </span>
              </div>
            )}

            {/* Year Built */}
            {property.yearBuilt && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    Năm xây dựng
                  </span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {property.yearBuilt}
                </span>
              </div>
            )}

            {/* Land Area */}
            {property.landArea && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    Diện tích đất
                  </span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {property.landArea} m²
                </span>
              </div>
            )}

            {/* Address */}
            {property.address?.fullAddress && (
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700 font-medium">Địa chỉ</span>
                </div>
                <span className="text-gray-900 font-medium text-right max-w-xs">
                  {property.address.fullAddress}
                </span>
              </div>
            )}

            {/* Created At */}
            {property.createdAt && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">Ngày đăng</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {formatDate(property.createdAt)}
                </span>
              </div>
            )}

            {/* Property ID */}
            {property.propertyId && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Mã tin</span>
                  <span
                    className="text-xs text-gray-600 font-mono"
                    title={property.propertyId}
                  >
                    {property.propertyId.slice(0, 12)}...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInfo;
