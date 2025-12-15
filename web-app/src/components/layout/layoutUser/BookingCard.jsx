import React from "react";
import {
  Calendar,
  DollarSign,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const BookingCard = ({ booking }) => {
  const {
    id,
    bookingReference,
    propertyId,
    leaseStart,
    leaseEnd,
    duration,
    monthlyRent,
    rentalDeposit,
    status,
    createdAt,
    onView,
    onCancel,
    onConfirm,
  } = booking;

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      PENDING_APPROVAL: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
        label: "Pending",
        icon: <Clock className="w-4 h-4" />,
      },
      ACTIVE: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        label: "Active",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      PAUSED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
        label: "Paused",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      TERMINATED: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        label: "Terminated",
        icon: <X className="w-4 h-4" />,
      },
      EXPIRED: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
        label: "Expired",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      RENEWED: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-300",
        label: "Renewed",
        icon: <CheckCircle className="w-4 h-4" />,
      },
    };
    return configs[status] || configs.PENDING_APPROVAL;
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {bookingReference}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          {/* <p className="text-sm text-gray-600">Property ID: {propertyId}</p> */}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Created</div>
          <div className="text-sm font-medium text-gray-900">{createdAt}</div>
        </div>
      </div>

      {/* Lease Period */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-1" />
          <div>
            <div className="text-xs text-gray-500">Start Date</div>
            <div className="text-sm font-medium text-gray-900">
              {leaseStart}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-1" />
          <div>
            <div className="text-xs text-gray-500">End Date</div>
            <div className="text-sm font-medium text-gray-900">{leaseEnd}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-blue-600 mt-1" />
          <div>
            <div className="text-xs text-gray-500">Duration</div>
            <div className="text-sm font-medium text-gray-900">{duration}</div>
          </div>
        </div>
      </div>

      {/* Financial Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Monthly Rent</div>
              <div className="text-sm font-semibold text-gray-900">
                {monthlyRent?.toLocaleString()} VND
              </div>
            </div>
          </div>
          {rentalDeposit > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Deposit</div>
                <div className="text-sm font-semibold text-gray-900">
                  {rentalDeposit?.toLocaleString()} VND
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>

        {status === "PENDING_APPROVAL" && onConfirm && (
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm
          </button>
        )}

        {(status === "PENDING_APPROVAL" || status === "ACTIVE") && onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            {status === "ACTIVE" ? "Terminate" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
