import React from "react";
import { User, Home, Calendar, Hash } from "lucide-react";
import TenantInfoSection from "./TenantInfoSection";
import PropertyDetailSection from "./PropertyDetailSection";

const BookingInfoSection = ({ booking, formatDate }) => {
  return (
    <div className="space-y-4">
      {/* Booking Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Booking Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 whitespace-nowrap">
              Booking Reference:
            </span>
            <span className="font-semibold text-blue-600">
              {booking.bookingReference || booking.id}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />

            <span className="text-gray-600 whitespace-nowrap">Created At:</span>
            <span className="flex items-center gap-1 font-medium text-gray-900">
              {formatDate(booking.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Tenant Information */}
      <TenantInfoSection tenantId={booking.tenantId} />

      {/* Property Information */}
      <PropertyDetailSection propertyId={booking.propertyId} />
    </div>
  );
};

export default BookingInfoSection;
