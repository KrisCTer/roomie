import React from "react";
import { Bed, Bath, Car, Maximize, Home } from "lucide-react";

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
      icon: <Car className="w-6 h-6" />,
      label: "Chỗ để xe",
      value: property.garages || 0,
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
    <div className="bg-white">
      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-4 text-left">
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-gray-700 shrink-0">
              {feature.icon}
            </div>

            {/* Text */}
            <div>
              <div className="text-lg font-bold text-gray-900">
                {feature.value}
              </div>
              <div className="text-sm text-gray-600">{feature.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Section */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Rent */}
          <div>
            <div className="text-sm font-medium text-blue-900 mb-2">
              Giá thuê hàng tháng
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {property.monthlyRent?.toLocaleString()}đ
              </span>
              <span className="text-gray-600">/tháng</span>
            </div>
          </div>

          {/* Deposit */}
          {property.rentalDeposit > 0 && (
            <div>
              <div className="text-sm font-medium text-blue-900 mb-2">
                Tiền cọc
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {property.rentalDeposit?.toLocaleString()}đ
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-900">
            💡 Giá thuê chưa bao gồm tiền điện, nước, internet và các dịch vụ
            khác
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;
