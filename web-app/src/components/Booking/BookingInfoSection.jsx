import React from "react";

const BookingInfoSection = ({ booking, formatDate }) => {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Booking Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Booking ID:</span>
          <p className="font-medium mt-1">{booking.id}</p>
        </div>
        <div>
          <span className="text-gray-600">Reference:</span>
          <p className="font-medium mt-1">
            {booking.bookingReference || booking.id}
          </p>
        </div>
        <div>
          <span className="text-gray-600">Tenant ID:</span>
          <p className="font-medium mt-1">{booking.tenantId}</p>
        </div>
        <div>
          <span className="text-gray-600">Created At:</span>
          <p className="font-medium mt-1">{formatDate(booking.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingInfoSection;
