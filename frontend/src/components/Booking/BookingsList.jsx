import React from "react";
import { AlertCircle } from "lucide-react";
import BookingCard from "./BookingCard.jsx";

const BookingsList = ({
  bookings,
  loading,
  viewMode,
  isOwner,
  bookingStatus,
  searchTerm,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No bookings found</p>
        <p className="text-sm mt-2">
          {bookingStatus || searchTerm
            ? "Try adjusting your filters"
            : viewMode === "OWNER"
            ? "No bookings for your properties yet"
            : "You haven't made any bookings yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} isOwner={isOwner} />
      ))}
    </div>
  );
};

export default BookingsList;
