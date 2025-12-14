import React from "react";
import { CheckCircle, FileText } from "lucide-react";

const BookingCard = ({ booking, onCreateContract, creatingContract }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Booking #{booking.bookingReference || booking.id}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tenant ID: {booking.tenantId}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Lease Period</p>
          <p className="text-sm font-medium">
            {formatDate(booking.leaseStart)} - {formatDate(booking.leaseEnd)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Monthly Rent</p>
          <p className="text-sm font-medium text-blue-600">
            {formatCurrency(booking.monthlyRent)}
          </p>
        </div>
      </div>

      <button
        onClick={() => onCreateContract(booking)}
        disabled={creatingContract}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {creatingContract ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating Contract...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Create Contract
          </>
        )}
      </button>
    </div>
  );
};

export default BookingCard;
