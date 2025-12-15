import React from "react";
import { User, Home } from "lucide-react";

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-6">
      <div className="flex border-b">
        {/* ===== TENANT TAB ===== */}
        <button
          onClick={() => onViewModeChange("TENANT")}
          className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
            viewMode === "TENANT"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            <span>My Bookings (Tenant)</span>
          </div>

          {viewMode === "TENANT" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        {/* ===== OWNER TAB ===== */}
        <button
          onClick={() => onViewModeChange("OWNER")}
          className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
            viewMode === "OWNER"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            <span>Property Bookings (Owner)</span>
          </div>

          {viewMode === "OWNER" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;
