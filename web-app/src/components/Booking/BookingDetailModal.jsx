import React, { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { getPropertyById } from "../../services/property.service";
import PropertyInfoSection from "./PropertyInfoSection";
import LeasePeriodSection from "./LeasePeriodSection";
import FinancialDetailsSection from "./FinancialDetailsSection";
import BookingInfoSection from "./BookingInfoSection";
import StatusBanner from "./StatusBanner";

const BookingDetailModal = ({
  booking,
  onClose,
  currentUserId,
  getStatusConfig,
  onConfirm,
  onCancel,
}) => {
  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (booking?.propertyId) {
      fetchPropertyDetails();
    }
  }, [booking]);

  const fetchPropertyDetails = async () => {
    try {
      setLoadingProperty(true);
      const response = await getPropertyById(booking.propertyId);
      if (response && response.result) {
        setProperty(response.result);
        const ownerCheck = response.result.owner?.ownerId === currentUserId;
        setIsOwner(ownerCheck);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoadingProperty(false);
    }
  };

  if (!booking) return null;

  const statusConfig = getStatusConfig(booking.status);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalCost = () => {
    const start = new Date(booking.leaseStart);
    const end = new Date(booking.leaseEnd);
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    const rentTotal = booking.monthlyRent * months;
    const deposit = booking.rentalDeposit || 0;
    return rentTotal + deposit;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Reference: {booking.bookingReference || booking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Role Badge */}
          {isOwner && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                You are the property owner for this booking
              </p>
            </div>
          )}

          {/* Status Banner */}
          <StatusBanner
            status={booking.status}
            statusConfig={statusConfig}
            isOwner={isOwner}
          />

          {/* Property Information */}
          {/* <PropertyInfoSection
            property={property}
            loading={loadingProperty}
            propertyId={booking.propertyId}
          /> */}

          {/* Lease Period */}
          <LeasePeriodSection
            leaseStart={booking.leaseStart}
            leaseEnd={booking.leaseEnd}
            formatDate={formatDate}
          />

          {/* Financial Details */}
          <FinancialDetailsSection
            booking={booking}
            calculateTotalCost={calculateTotalCost}
          />

          {/* Booking Information */}
          <BookingInfoSection booking={booking} formatDate={formatDate} />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {/* Confirm button - Only for owners on pending bookings */}
            {booking.status === "PENDING_APPROVAL" && isOwner && (
              <button
                onClick={() => {
                  onConfirm(booking.id);
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Booking
              </button>
            )}

            {/* Cancel button */}
            {(booking.status === "PENDING_APPROVAL" ||
              (isOwner && booking.status === "ACTIVE")) && (
              <button
                onClick={() => {
                  onCancel(booking.id);
                  onClose();
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                {booking.status === "ACTIVE"
                  ? "Terminate Lease"
                  : "Cancel Booking"}
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
