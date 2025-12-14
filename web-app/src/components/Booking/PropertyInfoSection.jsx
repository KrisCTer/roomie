import React from "react";
import { MapPin } from "lucide-react";

const PropertyInfoSection = ({ property, loading, propertyId }) => {
  if (loading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          Loading property details...
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mb-6 pb-6 border-b">
        <div className="text-sm text-gray-500">Property ID: {propertyId}</div>
      </div>
    );
  }

  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        Property Information
      </h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex gap-4">
          {property.mediaList?.[0]?.url && (
            <img
              src={property.mediaList[0].url}
              alt={property.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">{property.title}</h4>
            <p className="text-sm text-gray-600 mb-2">
              {property.address?.fullAddress ||
                `${property.address?.district}, ${property.address?.province}`}
            </p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{property.bedrooms} beds</span>
              <span>{property.bathrooms} baths</span>
              <span>{property.size} m²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoSection;
