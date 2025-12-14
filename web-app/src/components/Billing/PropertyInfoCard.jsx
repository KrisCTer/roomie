import React from "react";
import { Home } from "lucide-react";

const PropertyInfoCard = ({ property }) => {
  if (!property) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Thông tin bất động sản
      </h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Tên tài sản</p>
          <p className="font-medium text-gray-900">{property.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Địa chỉ</p>
          <p className="font-medium text-gray-900">
            {property.address?.fullAddress}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
