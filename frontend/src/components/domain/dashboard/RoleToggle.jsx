// src/components/Dashboard/RoleToggle.jsx
import React from "react";
import { Home, User } from "lucide-react";

const RoleToggle = ({ activeRole, onRoleChange }) => {
  return (
    <div className="flex items-center gap-2 apple-glass-soft rounded-xl p-1">
      {/* Landlord */}
      <button
        onClick={() => onRoleChange("landlord")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          activeRole === "landlord"
            ? "home-btn-accent text-white shadow-md"
            : "home-text-muted hover:bg-white/60 hover:home-text-primary"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">Landlord</span>
      </button>

      {/* Tenant */}
      <button
        onClick={() => onRoleChange("tenant")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          activeRole === "tenant"
            ? "home-btn-accent text-white shadow-md"
            : "home-text-muted hover:bg-white/60 hover:home-text-primary"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="font-medium">Tenant</span>
      </button>
    </div>
  );
};

export default RoleToggle;

