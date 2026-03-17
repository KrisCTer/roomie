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
      label: "Danh sách mới",
      color: "blue",
      action: () => navigate("/add-property"),
    },
    {
      icon: Search,
      label: "Tìm người thuê",
      color: "green",
      action: () => navigate("/search-tenants"),
    },
    {
      icon: QuickFile,
      label: "Tạo hợp đồng",
      color: "teal",
      action: () => navigate("/my-properties"),
    },
    {
      icon: MessageCircle,
      label: "Tin nhắn",
      color: "yellow",
      action: () => navigate("/message"),
    },
  ];

  const tenantActions = [
    {
      icon: Search,
      label: "Tìm nhà",
      color: "blue",
      action: () => navigate("/search"),
    },
    {
      icon: QuickFile,
      label: "Hợp đồng của tôi",
      color: "teal",
      action: () => navigate("/my-contracts"),
    },
    {
      icon: MessageCircle,
      label: "Tin nhắn",
      color: "yellow",
      action: () => navigate("/messages"),
    },
    {
      icon: Settings,
      label: "Cài đặt tài khoản",
      color: "gray",
      action: () => navigate("/profile"),
    },
  ];

  const actions = role === "landlord" ? landlordActions : tenantActions;

  const colorClasses = {
    blue: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
    green:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    teal: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
    yellow: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    gray: "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200",
  };

  return (
    <div className="apple-glass-panel rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`apple-glass-item p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white ${
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
