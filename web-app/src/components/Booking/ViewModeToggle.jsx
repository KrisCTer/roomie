import React from "react";

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="mb-6">
      <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
        <button
          onClick={() => onViewModeChange("TENANT")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "TENANT"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Bookings (Tenant)
        </button>
        <button
          onClick={() => onViewModeChange("OWNER")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "OWNER"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Property Bookings (Owner)
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;
