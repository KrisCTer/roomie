import React from "react";
import { Home, MapPin, BedDouble, Bath, Ruler } from "lucide-react";

const PropertyInfoCard = ({ property }) => {
  if (!property) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-sm text-gray-500">
        No property information available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Home className="w-6 h-6 text-blue-600" />
        Property Information
      </h2>

      <div className="flex gap-4">
        {/* Image */}
        {property.mediaList?.[0]?.url && (
          <img
            src={property.mediaList[0].url}
            alt={property.title}
            className="w-28 h-28 object-cover rounded-lg flex-shrink-0 border"
          />
        )}

        {/* Details */}
        <div className="flex-1 space-y-3 text-sm">
          {/* Name */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 whitespace-nowrap">Name:</span>
            <span className="font-semibold text-gray-900 truncate">
              {property.title}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <span className="text-gray-600 whitespace-nowrap">Address:</span>
            <span className="flex items-start gap-1 font-medium text-gray-900">
              <span className="break-words">
                {property.address?.fullAddress ||
                  `${property.address?.street || ""}, ${
                    property.address?.district || ""
                  }, ${property.address?.province || ""}`}
              </span>
            </span>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-blue-500" />
              {property.bedrooms ?? 0} bedrooms
            </span>

            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-purple-500" />
              {property.bathrooms ?? 0} bathrooms
            </span>

            <span className="flex items-center gap-1">
              <Ruler className="w-4 h-4 text-green-500" />
              {property.size ?? 0} m²
            </span>
          </div>

          {/* Monthly Rent */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 whitespace-nowrap">
              Monthly Rent:
            </span>
            <span className="font-bold text-purple-600 text-lg">
              {new Intl.NumberFormat("vi-VN").format(property.monthlyRent || 0)}{" "}
              ₫ / month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
