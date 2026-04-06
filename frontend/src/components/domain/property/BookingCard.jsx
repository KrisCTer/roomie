import React from "react";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Info,
} from "lucide-react";
import WheelDatePicker from "./WheelDatePicker";

const BookingCard = ({
  property,
  leaseStart,
  leaseEnd,
  leaseDuration,
  estimatedCost,
  bookingLoading,
  onLeaseStartChange,
  onLeaseEndChange,
  onBooking,
  loading,
  setLeaseStart,
  setLeaseEnd,
  onBook,
}) => {
  const isSubmitting = bookingLoading || loading;
  const handleStartChange = onLeaseStartChange || setLeaseStart;
  const handleEndChange = onLeaseEndChange || setLeaseEnd;
  const handleBooking = onBooking || onBook;
  const today = new Date().toISOString().split("T")[0];
  const isAvailable = property?.propertyStatus === "AVAILABLE";
  const formatCurrency = (amount) =>
    Math.round(Number(amount || 0)).toLocaleString("vi-VN");

  const normalizeStartDate = (nextDate) => {
    if (!nextDate) return today;
    return nextDate < today ? today : nextDate;
  };

  const normalizeEndDate = (nextDate, startDate) => {
    const minEndDate = startDate || today;
    if (!nextDate) return minEndDate;
    return nextDate < minEndDate ? minEndDate : nextDate;
  };

  const handleStartDateChange = (nextDate) => {
    const normalizedStart = normalizeStartDate(nextDate);
    handleStartChange?.(normalizedStart);

    if (leaseEnd && leaseEnd < normalizedStart) {
      handleEndChange?.(normalizedStart);
    }
  };

  const handleEndDateSelection = (nextDate) => {
    const normalizedEnd = normalizeEndDate(nextDate, leaseStart);
    handleEndChange?.(normalizedEnd);
  };

  const isDateRangeValid =
    !!leaseStart && !!leaseEnd && leaseStart >= today && leaseEnd >= leaseStart;

  return (
    <div className="bg-white rounded-2xl shadow-[0_16px_42px_rgba(17,24,39,0.08)] border border-[#ECDCC8] p-6 sticky top-24">
      {/* Price Header */}
      <div className="mb-6 pb-6 border-b border-[#EFE3D4]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9A3412]">
          Tinh toan chi phi
        </p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-[#111827]">
            {formatCurrency(property.monthlyRent)}đ
          </span>
          <span className="text-gray-600">/tháng</span>
        </div>

        {property.rentalDeposit > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <CreditCard className="w-4 h-4 text-[#9A3412]" />
            <p className="text-sm text-gray-600">
              Cọc:{" "}
              <span className="font-semibold">
                {formatCurrency(property.rentalDeposit)}đ
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Date Selection */}
      <div className="space-y-4 mb-6">
        {/* Start Date */}
        <WheelDatePicker
          value={leaseStart}
          onchange={handleStartDateChange}
          minDate={today}
          label="Ngày bắt đầu thuê"
        />

        {/* End Date */}
        <WheelDatePicker
          value={leaseEnd}
          onchange={handleEndDateSelection}
          minDate={leaseStart || today}
          label="Ngày kết thúc thuê"
        />
      </div>

      {/* Cost Breakdown */}
      {leaseStart && leaseEnd && leaseDuration > 0 && (
        <div className="bg-[#FFFBF6] rounded-xl p-4 mb-6 space-y-3 border border-[#ECDCC8]">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">
              {formatCurrency(property.monthlyRent)}đ × {leaseDuration} tháng
            </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(property.monthlyRent * leaseDuration)}đ
            </span>
          </div>

          {property.rentalDeposit > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tiền cọc</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(property.rentalDeposit)}đ
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-300 flex justify-between">
            <span className="font-bold text-gray-900">Tổng cộng</span>
            <span className="text-xl font-bold text-[#C2410C]">
              {formatCurrency(estimatedCost)}đ
            </span>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={
          isSubmitting ||
          !leaseStart ||
          !leaseEnd ||
          !isDateRangeValid ||
          !isAvailable
        }
        className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          !isAvailable
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#CC6F4A] hover:bg-[#b7603f] shadow-md hover:shadow-lg active:scale-95"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Đang xử lý...
          </>
        ) : !isAvailable ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Không khả dụng
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Đặt thuê ngay
          </>
        )}
      </button>

      {/* Info Notes */}
      <div className="mt-4 space-y-2">
        <div className="p-3 bg-[#FFF4E8] border border-[#F5D9C4] rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-xs text-amber-900">
            Bạn chưa bị tính phí cho đến khi chủ nhà xác nhận đặt phòng.
          </p>
        </div>

        {leaseStart && leaseEnd && leaseDuration > 0 && (
          <div className="p-3 bg-[#F9FBFF] border border-[#D9E7FF] rounded-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1D4ED8] shrink-0" />
            <p className="text-xs text-[#1E3A8A]">
              Thời gian thuê:{" "}
              <span className="font-semibold">{leaseDuration} tháng</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
