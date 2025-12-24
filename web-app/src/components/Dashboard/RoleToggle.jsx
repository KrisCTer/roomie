// src/pages/User/Dashboard/components/RoleToggle.jsx
import React from "react";
import { Home, User } from "lucide-react";

const RoleToggle = ({ activeRole, onRoleChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
      {/* Landlord */}
      <button
        onClick={() => onRoleChange("landlord")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          activeRole === "landlord"
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">Landlord</span>
      </button>

      {/* Tenant */}
      <button
        onClick={() => onRoleChange("tenant")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          activeRole === "tenant"
            ? "bg-green-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="font-medium">Tenant</span>
      </button>
    </div>
  );
};

export default RoleToggle;
