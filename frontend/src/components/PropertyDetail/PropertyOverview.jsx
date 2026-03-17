import React from "react";
import { Bed, Bath, Car, Maximize, Users, Info } from "lucide-react";

const PropertyOverview = ({ property }) => {
  const features = [
    {
      icon: <Bed className="w-6 h-6" />,
      label: "Phòng ngủ",
      value: property.bedrooms || 0,
      unit: "phòng",
    },
    {
      icon: <Bath className="w-6 h-6" />,
      label: "Phòng tắm",
      value: property.bathrooms || 0,
      unit: "phòng",
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Sức chứa",
      value: property.rooms || property.garages || 0,
      unit: "chỗ",
    },
    {
      icon: <Maximize className="w-6 h-6" />,
      label: "Diện tích",
      value: property.size || 0,
      unit: "m²",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#ECDCC8] bg-white p-6 shadow-[0_14px_32px_rgba(17,24,39,0.06)]">
      <h2 className="mb-5 text-2xl font-bold text-[#1F2937]">
        Tổng quan bất động sản
      </h2>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#ECDCC8] bg-[#FFFBF6] p-4"
          >
            {/* Icon */}
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#F0E5D8] bg-white text-[#CC6F4A]">
              {feature.icon}
            </div>

            {/* Text */}
            <div>
              <div className="text-sm font-semibold text-[#6B7280]">
                {feature.label}
              </div>
              <div className="mt-1 text-2xl font-bold text-[#111827]">
                {feature.value}
                <span className="ml-1 text-sm font-medium text-[#6B7280]">
                  {feature.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Section */}
      <div className="mt-8 rounded-2xl border border-[#F5D9C4] bg-[#FFF4E8] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A3412]">
          Giá thuê
        </p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-4xl font-extrabold leading-none text-[#C2410C] md:text-5xl">
            {property.monthlyRent?.toLocaleString()}đ
          </span>
          <span className="pb-1 text-base font-medium text-[#7C2D12]">
            /tháng
          </span>
        </div>

        {property.rentalDeposit > 0 && (
          <p className="mt-3 text-sm text-[#7C2D12]">
            Tiền cọc:{" "}
            <span className="font-bold">
              {property.rentalDeposit?.toLocaleString()}đ
            </span>
          </p>
        )}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#EBC9AA] bg-[#FFF8F1] p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />
        <p className="text-sm text-[#9A3412]">
          Giá thuê chưa bao gồm tiền điện, nước, internet và các dịch vụ khác.
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;
