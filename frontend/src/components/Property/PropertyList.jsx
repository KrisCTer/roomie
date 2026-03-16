import React from "react";
import PropertyCard from "./PropertyCard";

const PropertyList = ({
  properties,
  loading,
  onEdit,
  onViewBookings,
  onDelete,
  onPublish,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">No properties found</p>
        <p className="text-sm mt-2">
          Try adjusting your filters or add a new property
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.propertyId}
          property={property}
          onEdit={onEdit}
          onViewBookings={onViewBookings}
          onDelete={onDelete}
          onPublish={onPublish}
        />
      ))}
    </div>
  );
};

export default PropertyList;
