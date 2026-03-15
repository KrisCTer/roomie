import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Info,
} from "lucide-react";

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
}) => {
  const today = new Date().toISOString().split("T")[0];
  const isAvailable = property.propertyStatus === "AVAILABLE";
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const [displayStartDate, setDisplayStartDate] = useState("");
  const [displayEndDate, setDisplayEndDate] = useState("");

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (leaseStart) setDisplayStartDate(formatDateForDisplay(leaseStart));
  }, [leaseStart]);

  useEffect(() => {
    if (leaseEnd) setDisplayEndDate(formatDateForDisplay(leaseEnd));
  }, [leaseEnd]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Price Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-gray-900">
            {property.monthlyRent?.toLocaleString()}đ
          </span>
          <span className="text-gray-600">/tháng</span>
        </div>

        {property.rentalDeposit > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <p className="text-sm text-gray-600">
              Cọc:{" "}
              <span className="font-semibold">
                {property.rentalDeposit.toLocaleString()}đ
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Date Selection */}
      <div className="space-y-4 mb-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ngày bắt đầu thuê
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => startDateRef.current?.showPicker?.()}
          >
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
            <input
              type="text"
              value={displayStartDate}
              readOnly
              placeholder="dd/MM/yyyy"
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              ref={startDateRef}
              type="date"
              min={today}
              value={leaseStart}
              onChange={(e) => onLeaseStartChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ngày kết thúc thuê
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => endDateRef.current?.showPicker?.()}
          >
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
            <input
              type="text"
              value={displayEndDate}
              readOnly
              placeholder="dd/MM/yyyy"
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              ref={endDateRef}
              type="date"
              min={leaseStart || today}
              value={leaseEnd}
              onChange={(e) => onLeaseEndChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {leaseStart && leaseEnd && leaseDuration > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3 border border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">
              {property.monthlyRent.toLocaleString()}đ × {leaseDuration} tháng
            </span>
            <span className="font-semibold text-gray-900">
              {(property.monthlyRent * leaseDuration).toLocaleString()}đ
            </span>
          </div>

          {property.rentalDeposit > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tiền cọc</span>
              <span className="font-semibold text-gray-900">
                {property.rentalDeposit.toLocaleString()}đ
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-300 flex justify-between">
            <span className="font-bold text-gray-900">Tổng cộng</span>
            <span className="text-xl font-bold text-blue-600">
              {estimatedCost.toLocaleString()}đ
            </span>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <button
        onClick={onBooking}
        disabled={bookingLoading || !leaseStart || !leaseEnd || !isAvailable}
        className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          !isAvailable
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {bookingLoading ? (
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
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-xs text-amber-900">
            Bạn chưa bị tính phí cho đến khi chủ nhà xác nhận đặt phòng.
          </p>
        </div>

        {leaseStart && leaseEnd && leaseDuration > 0 && (
          <div className="  p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
            <p className="text-xs text-blue-900">
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
