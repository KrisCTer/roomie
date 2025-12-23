// src/components/Booking/BookingCard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Calendar, CheckCircle, AlertCircle } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Price */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-gray-900">
            {property.monthlyRent?.toLocaleString()}đ
          </span>
          <span className="text-gray-500">/month</span>
        </div>

        {property.rentalDeposit > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            + {property.rentalDeposit.toLocaleString()}đ deposit
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="space-y-4 mb-6">
        {/* Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lease start date
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => startDateRef.current?.showPicker?.()}
          >
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              value={displayStartDate}
              readOnly
              placeholder="dd/MM/yyyy"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white cursor-pointer"
            />
            <input
              ref={startDateRef}
              type="date"
              min={today}
              value={leaseStart}
              onChange={(e) => onLeaseStartChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0"
            />
          </div>
        </div>

        {/* End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lease end date
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => endDateRef.current?.showPicker?.()}
          >
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              value={displayEndDate}
              readOnly
              placeholder="dd/MM/yyyy"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white cursor-pointer"
            />
            <input
              ref={endDateRef}
              type="date"
              min={leaseStart || today}
              value={leaseEnd}
              onChange={(e) => onLeaseEndChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0"
            />
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      {leaseStart && leaseEnd && leaseDuration > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {property.monthlyRent.toLocaleString()}đ × {leaseDuration} month
              {leaseDuration > 1 ? "s" : ""}
            </span>
            <span className="font-medium text-gray-900">
              {(property.monthlyRent * leaseDuration).toLocaleString()}đ
            </span>
          </div>

          {property.rentalDeposit > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Deposit</span>
              <span className="font-medium text-gray-900">
                {property.rentalDeposit.toLocaleString()}đ
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {estimatedCost.toLocaleString()}đ
            </span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onBooking}
        disabled={bookingLoading || !leaseStart || !leaseEnd || !isAvailable}
        className={`w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2
          ${
            !isAvailable
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {bookingLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : !isAvailable ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Not Available
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Request to book
          </>
        )}
      </button>

      {/* Info note */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-800 text-center">
          💡 You won’t be charged until the owner confirms your booking.
        </p>
      </div>
    </div>
  );
};

export default BookingCard;
