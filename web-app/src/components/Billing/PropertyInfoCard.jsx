import React from "react";
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Image as ImageIcon,
} from "lucide-react";

const PropertyInfoCard = ({ property }) => {
  if (!property) return null;

  const address =
    property.address?.fullAddress ||
    `${property.address?.street || ""}, ${property.address?.district || ""}, ${
      property.address?.province || ""
    }`;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Home className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-gray-900">Property Information</h3>
      </div>

      <div className="flex gap-4">
        {/* Image */}
        {property.mediaList?.[0]?.url && (
          <img
            src={property.mediaList[0].url}
            alt={property.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}

        {/* Details */}
        <div className="flex-1 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 whitespace-nowrap">Name:</span>
            <span className="font-semibold text-gray-900 truncate">
              {property.title}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <span className="text-gray-600 whitespace-nowrap">Address:</span>

            <span className="flex items-start gap-1 font-medium text-gray-900">
              <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <span className="break-words">
                {property.address?.fullAddress ||
                  `${property.address?.street || ""}, ${
                    property.address?.district || ""
                  }, ${property.address?.province || ""}`}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-blue-500" />
              {property.bedrooms ?? 0} beds
            </span>

            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-purple-500" />
              {property.bathrooms ?? 0} baths
            </span>

            <span className="flex items-center gap-1">
              <Ruler className="w-4 h-4 text-green-500" />
              {property.size ?? 0} m²
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 whitespace-nowrap">
              Monthly Rent:
            </span>

            <span className="font-bold text-purple-600 text-lg">
              {new Intl.NumberFormat("vi-VN").format(property.monthlyRent)} đ /
              month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
