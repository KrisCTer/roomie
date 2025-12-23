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
      label: "Đăng tin mới",
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
      color: "purple",
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
      color: "purple",
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
      label: "Cài đặt",
      color: "gray",
      action: () => navigate("/profile"),
    },
  ];

  const actions = role === "landlord" ? landlordActions : tenantActions;

  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30",
    green:
      "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30",
    purple:
      "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30",
    yellow:
      "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30",
    gray: "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/30",
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
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
