// QuickActions.jsx
import React from "react";
import {
  Plus,
  Search,
  FileText as QuickFile,
  MessageCircle,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = ({ role }) => {
  const navigate = useNavigate();

  const landlordActions = [
    {
      icon: Plus,
      label: "New Listing",
      color: "blue",
      action: () => navigate("/add-property"),
    },
    {
      icon: Search,
      label: "Find Tenants",
      color: "green",
      action: () => navigate("/search-tenants"),
    },
    {
      icon: QuickFile,
      label: "Create Contract",
      color: "purple",
      action: () => navigate("/my-properties"),
    },
    {
      icon: MessageCircle,
      label: "Messages",
      color: "yellow",
      action: () => navigate("/message"),
    },
  ];

  const tenantActions = [
    {
      icon: Search,
      label: "Find Home",
      color: "blue",
      action: () => navigate("/search"),
    },
    {
      icon: QuickFile,
      label: "My Contracts",
      color: "purple",
      action: () => navigate("/my-contracts"),
    },
    {
      icon: MessageCircle,
      label: "Messages",
      color: "yellow",
      action: () => navigate("/messages"),
    },
    {
      icon: Settings,
      label: "Settings",
      color: "gray",
      action: () => navigate("/profile"),
    },
  ];

  const actions = role === "landlord" ? landlordActions : tenantActions;

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200",
    green: "bg-green-100 text-green-600 hover:bg-green-200 border-green-200",
    purple:
      "bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200",
    yellow:
      "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-yellow-200",
    gray: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`p-4 rounded-xl border transition-all ${
              colorClasses[action.color]
            }`}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium text-center">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
