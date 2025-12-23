import React from "react";
import { Info, Calendar, Tag, CheckCircle, Home } from "lucide-react";

const PropertyInfo = ({ property }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const infoItems = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "Property ID",
      value: property.propertyId?.slice(0, 8) + "..." || "-",
      fullValue: property.propertyId,
    },
    {
      icon: <Tag className="w-4 h-4" />,
      label: "Property Type",
      value: property.propertyType,
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: "Status",
      value: property.propertyStatus,
      badge: true,
    },
  ];

  if (property.propertyLabel && property.propertyLabel !== "NONE") {
    infoItems.push({
      icon: <Tag className="w-4 h-4" />,
      label: "Label",
      value: property.propertyLabel,
      badge: true,
    });
  }

  if (property.yearBuilt) {
    infoItems.push({
      icon: <Calendar className="w-4 h-4" />,
      label: "Year Built",
      value: property.yearBuilt,
    });
  }

  if (property.landArea) {
    infoItems.push({
      icon: <Home className="w-4 h-4" />,
      label: "Land Area",
      value: `${property.landArea} m²`,
    });
  }

  if (property.createdAt) {
    infoItems.push({
      icon: <Calendar className="w-4 h-4" />,
      label: "Listed On",
      value: formatDate(property.createdAt),
    });
  }

  return (
    <div className="border border-gray-300 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold">Property Details</h3>
      </div>

      <div className="space-y-3">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
            title={item.fullValue}
          >
            <div className="flex items-center gap-2 text-gray-600">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="text-right">
              {item.badge ? (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                  {item.value}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {item.value || "-"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Approval Status Badge */}
      {property.status && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Approval Status</span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                property.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : property.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {property.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInfo;
