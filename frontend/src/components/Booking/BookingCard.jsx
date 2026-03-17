/* aria-label */
import React from "react";
import {
  Calendar,
  DollarSign,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCircle,
} from "lucide-react";

const BookingCard = ({ booking, isOwner }) => {
  const {
    bookingReference,
    leaseStart,
    leaseEnd,
    duration,
    monthlyRent,
    rentalDeposit,
    status,
    createdAt,
    tenantId,
    onView,
    onCancel,
    onConfirm,
    onViewTenantProfile,
  } = booking;

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      PENDING_APPROVAL: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-300",
        label: "Pending",
        icon: <Clock className="w-4 h-4" />,
      },
      ACTIVE: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-300",
        label: "Active",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      PAUSED: {
        bg: "bg-sky-100",
        text: "text-sky-800",
        border: "border-sky-300",
        label: "Paused",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      TERMINATED: {
        bg: "bg-rose-100",
        text: "text-rose-800",
        border: "border-rose-300",
        label: "Terminated",
        icon: <X className="w-4 h-4" />,
      },
      EXPIRED: {
        bg: "bg-stone-100",
        text: "text-stone-800",
        border: "border-stone-300",
        label: "Expired",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      RENEWED: {
        bg: "bg-teal-100",
        text: "text-teal-800",
        border: "border-teal-300",
        label: "Renewed",
        icon: <CheckCircle className="w-4 h-4" />,
      },
    };
    return configs[status] || configs.PENDING_APPROVAL;
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="border border-[#ECE1D3] rounded-2xl p-6 hover:shadow-[0_12px_28px_rgba(17,24,39,0.08)] transition-all duration-200 bg-white">
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
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Ngày tạo</div>
          <div className="text-sm font-medium text-gray-900">{createdAt}</div>
        </div>
      </div>

      {/* Lease Period */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#EFE6DA]">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-orange-600 mt-1" />
          <div>
            <div className="text-xs text-gray-500">Ngày bắt đầu</div>
            <div className="text-sm font-medium text-gray-900">
              {leaseStart}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-orange-600 mt-1" />
          <div>
            <div className="text-xs text-gray-500">Ngày kết thúc</div>
            <div className="text-sm font-medium text-gray-900">{leaseEnd}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-orange-600 mt-1" />
          <div>
            <div className="text-xs text-gray-500">Thời gian</div>
            <div className="text-sm font-medium text-gray-900">{duration}</div>
          </div>
        </div>
      </div>

      {/* Financial Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Tiền thuê hàng tháng</div>
              <div className="text-sm font-semibold text-gray-900">
                {monthlyRent?.toLocaleString()} VND
              </div>
            </div>
          </div>
          {rentalDeposit > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Tiền đặt cọc</div>
                <div className="text-sm font-semibold text-gray-900">
                  {rentalDeposit?.toLocaleString()} VND
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onView}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>

        {/* View Tenant Profile Button - Only show for owners */}
        {isOwner && tenantId && onViewTenantProfile && (
          <button
            onClick={onViewTenantProfile}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            <UserCircle className="w-4 h-4" />
            Hồ sơ người thuê
          </button>
        )}

        {status === "PENDING_APPROVAL" && onConfirm && (
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Xác nhận
          </button>
        )}

        {(status === "PENDING_APPROVAL" || status === "ACTIVE") && onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            {status === "ACTIVE" ? "Kết thúc" : "Hủy bỏ"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
