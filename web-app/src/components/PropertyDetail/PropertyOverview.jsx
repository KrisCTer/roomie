import React from "react";
import { Bed, Bath, Car, Maximize, Home, Calendar } from "lucide-react";

const PropertyOverview = ({ property }) => {
  const features = [
    {
      icon: <Bed className="w-5 h-5" />,
      label: "Bedrooms",
      value: property.bedrooms || 0,
    },
    {
      icon: <Bath className="w-5 h-5" />,
      label: "Bathrooms",
      value: property.bathrooms || 0,
    },
    {
      icon: <Car className="w-5 h-5" />,
      label: "Garages",
      value: property.garages || 0,
    },
    {
      icon: <Maximize className="w-5 h-5" />,
      label: "Size",
      value: `${property.size || 0} m²`,
    },
  ];

  return (
    <div className="pb-8 border-b border-gray-200">
      {/* Property hosted info */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          {property.propertyType} in {property.address?.district || "Location"}
        </h2>
        <div className="flex items-center gap-2 text-gray-600">
          <span>{property.bedrooms || 0} bedrooms</span>
          <span>·</span>
          <span>{property.bathrooms || 0} bathrooms</span>
          <span>·</span>
          <span>{property.size || 0} m²</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-200">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="text-gray-700">{feature.icon}</div>
            <div>
              <div className="font-semibold text-lg text-gray-900">
                {feature.value}
              </div>
              <div className="text-sm text-gray-600">{feature.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Section */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Monthly rent</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-gray-900">
              {property.monthlyRent?.toLocaleString()}đ
            </span>
            <span className="text-gray-600">/month</span>
          </div>
          {property.rentalDeposit > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              Deposit: {property.rentalDeposit?.toLocaleString()}đ
            </div>
          )}
        </div>

        {property.yearBuilt && (
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Year built</div>
            <div className="text-xl font-semibold text-gray-900">
              {property.yearBuilt}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyOverview;
