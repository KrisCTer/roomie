import React from "react";

const BookingFilters = ({
  bookingStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Booking Status <span className="text-red-500">*</span>
        </label>
        <select
          value={bookingStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="TERMINATED">Terminated</option>
          <option value="EXPIRED">Expired</option>
          <option value="RENEWED">Renewed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Search by reference or property ID"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default BookingFilters;
