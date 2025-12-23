// src/pages/User/Dashboard/components/RoleToggle.jsx
import React from "react";
import { Home, User } from "lucide-react";

const RoleToggle = ({ activeRole, onRoleChange }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1 border border-slate-700">
      <button
        onClick={() => onRoleChange("landlord")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          activeRole === "landlord"
            ? "bg-blue-600 text-white shadow-lg"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">Chủ nhà</span>
      </button>
      <button
        onClick={() => onRoleChange("tenant")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          activeRole === "tenant"
            ? "bg-green-600 text-white shadow-lg"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="font-medium">Người thuê</span>
      </button>
    </div>
  );
};

export default RoleToggle;
