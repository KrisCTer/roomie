import React from "react";
import { Home, User } from "lucide-react";

const ContractTabs = ({
  activeTab,
  onTabChange,
  landlordCount,
  tenantCount,
}) => {
  return (
    <div className="flex gap-2">
      {/* Landlord tab */}
      <button
        onClick={() => onTabChange("landlord")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
          activeTab === "landlord"
            ? "bg-[#CC6F4A] text-white"
            : "bg-white/40 text-gray-700 hover:bg-white/60"
        }`}
      >
        <Home className="w-4 h-4" />
        <span>As Landlord</span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === "landlord" ? "bg-white/30" : "bg-white/40"
          }`}
        >
          {landlordCount}
        </span>
      </button>

      {/* Tenant tab */}
      <button
        onClick={() => onTabChange("tenant")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
          activeTab === "tenant"
            ? "bg-[#CC6F4A] text-white"
            : "bg-white/40 text-gray-700 hover:bg-white/60"
        }`}
      >
        <User className="w-4 h-4" />
        <span>As Tenant</span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === "tenant" ? "bg-white/30" : "bg-white/40"
          }`}
        >
          {tenantCount}
        </span>
      </button>
    </div>
  );
};

export default ContractTabs;
