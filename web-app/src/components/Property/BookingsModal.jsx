import React from "react";
import { X, FileText } from "lucide-react";
import BookingCard from "./BookingCard";

const BookingsModal = ({
  show,
  onClose,
  selectedProperty,
  bookings,
  loading,
  onCreateContract,
  creatingContract,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Bookings</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedProperty?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No active bookings available for contract creation
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Bookings must be in ACTIVE status to create contracts
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCreateContract={onCreateContract}
                  creatingContract={creatingContract}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsModal;
