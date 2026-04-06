import React from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="home-glass-soft rounded-2xl p-12 text-center">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No contracts found
      </h3>
      <p className="text-gray-600 mb-6">
        {activeTab === "landlord"
          ? "You don't have any contracts as a landlord yet"
          : "You don't have any rental contracts yet"}
      </p>
      <button
        onClick={() =>
          navigate(activeTab === "landlord" ? "/my-properties" : "/")
        }
        className="px-6 py-3 bg-[#CC6F4A] text-white rounded-lg hover:bg-[#B85A39] transition-colors font-medium"
      >
        {activeTab === "landlord"
          ? "View your properties"
          : "Find a place to rent"}
      </button>
    </div>
  );
};

export default EmptyState;
