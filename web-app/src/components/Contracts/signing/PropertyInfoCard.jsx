import React from "react";
import { Home } from "lucide-react";

const PropertyInfoCard = ({ property }) => {
  if (!property) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Home className="w-6 h-6 text-blue-600" />
        Thông tin tài sản
      </h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Tên tài sản</p>
          <p className="font-medium text-gray-900">{property.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Địa chỉ</p>
          <p className="font-medium text-gray-900">
            {property.address?.fullAddress || property.address}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Diện tích</p>
            <p className="font-medium text-gray-900">{property.size} m²</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Loại hình</p>
            <p className="font-medium text-gray-900">{property.propertyType}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
