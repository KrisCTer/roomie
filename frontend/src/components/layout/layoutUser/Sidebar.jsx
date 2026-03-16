// src/components/layout/layoutUser/Sidebar.jsx
import React, { useMemo } from "react";
import {
  Home,
  User,
  BarChart3,
  Building,
  MessageSquare,
  Plus,
  LogOut,
  Contact,
  BookOpen,
  FileText,
  Zap,
  DollarSign,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useRole } from "../../../contexts/RoleContext";
import { useUser } from "../../../contexts/UserContext";

const Sidebar = ({ activeMenu, setActiveMenu, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { activeRole } = useRole();
  const { user, loading } = useUser();

  /* =========================
   * MENU CONFIG
   * ========================= */
  const landlordMenuItems = [
    { icon: BarChart3, label: t("Dashboard"), path: "/dashboard" },
    { icon: Building, label: t("My Properties"), path: "/my-properties" },
    { icon: Plus, label: t("Add Property"), path: "/add-property" },
    { icon: BookOpen, label: t("Bookings"), path: "/my-bookings" },
    { icon: Contact, label: t("Contracts"), path: "/my-contracts" },
    { icon: FileText, label: t("Bills"), path: "/unified-bills" },
    { icon: Zap, label: t("Utility Config"), path: "/utility-config" },
    { icon: MessageSquare, label: t("Messages"), path: "/message" },
    { icon: User, label: t("Profile"), path: "/profile" },
  ];

  const tenantMenuItems = [
    { icon: BarChart3, label: t("Dashboard"), path: "/dashboard" },
    { icon: BookOpen, label: t("My Bookings"), path: "/my-bookings" },
    { icon: Contact, label: t("My Contracts"), path: "/my-contracts" },
    { icon: DollarSign, label: t("My Bills"), path: "/unified-bills" },
    { icon: MessageSquare, label: t("Messages"), path: "/message" },
    { icon: User, label: t("Profile"), path: "/profile" },
  ];

  const menuItems = useMemo(() => {
    const roleItems =
      activeRole === "landlord" ? landlordMenuItems : tenantMenuItems;
    return [...roleItems];
  }, [activeRole, t]);

  /* =========================
   * USER DISPLAY (FROM CONTEXT)
   * ========================= */
  const displayUser = useMemo(() => {
    if (!user) return null;

    return {
      username: user.username || "User",
      email: user.email || "",
      avatar: user.avatar || "",
      fullName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.username,
    };
  }, [user]);

  const handleNavigation = (item) => {
    setActiveMenu(item.label);

    if (item.path === "/logout") {
      localStorage.clear();
      navigate("/login");
      return;
    }

    navigate(item.path);
  };

  const isActive = (path) => location.pathname === path;

  /* =========================
   * AVATAR
   * ========================= */
  const renderAvatar = () => {
    if (displayUser?.avatar) {
      return (
        <img
          src={displayUser.avatar}
          alt={displayUser.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    const initial =
      displayUser?.fullName?.[0] || displayUser?.username?.[0] || "U";

    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {initial.toUpperCase()}
        </span>
      </div>
    );
  };

  /* =========================
   * RENDER
   * ========================= */
  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } bg-slate-900 text-white transition-all duration-300 overflow-hidden fixed left-0 top-0 h-full z-50`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Roomie</h1>
            <p className="text-xs text-gray-400">real home, real value</p>
          </div>
        </div>

        {/* Profile */}
        <div className="mb-8 pb-6 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-3">Profile</p>

          <div className="flex items-center gap-3">
            {renderAvatar()}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {displayUser?.fullName || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {displayUser?.email || "No email"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path) ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-700 mt-4">
          <p className="text-xs text-gray-400 text-center">© 2025 Roomie</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

