import React from "react";
import { Home, User } from "lucide-react";

const BillTabs = ({ activeTab, onTabChange, landlordCount, tenantCount }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-6">
      <div className="flex border-b">
        <button
          onClick={() => onTabChange("landlord")}
          className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
            activeTab === "landlord"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            <span>Vai trò Chủ nhà</span>
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {landlordCount}
            </span>
          </div>
          {activeTab === "landlord" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>

        <button
          onClick={() => onTabChange("tenant")}
          className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
            activeTab === "tenant"
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            <span>Vai trò Người thuê</span>
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {tenantCount}
            </span>
          </div>
          {activeTab === "tenant" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default BillTabs;
