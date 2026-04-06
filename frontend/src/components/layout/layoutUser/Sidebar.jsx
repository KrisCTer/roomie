// src/components/layout/layoutUser/Sidebar.jsx
import React, { useMemo } from "react";
import {
  Home,
  User,
  BarChart3,
  Building,
  MessageSquare,
  Plus,
  Contact,
  BookOpen,
  FileText,
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
  const { user } = useUser();

  /* =========================
   * MENU CONFIG (i18n role-based)
   * ========================= */
  const landlordMenuItems = [
    {
      icon: BarChart3,
      label: t("sidebar.landlord.dashboard"),
      path: "/dashboard",
    },
    {
      icon: Building,
      label: t("sidebar.landlord.myProperties"),
      path: "/my-properties",
    },
    {
      icon: Plus,
      label: t("sidebar.landlord.addProperty"),
      path: "/add-property",
    },
    {
      icon: BookOpen,
      label: t("sidebar.landlord.bookingRequests"),
      path: "/my-bookings",
    },
    {
      icon: Contact,
      label: t("sidebar.landlord.contracts"),
      path: "/my-contracts",
    },
    {
      icon: FileText,
      label: t("sidebar.landlord.bills"),
      path: "/unified-bills",
    },
    {
      icon: MessageSquare,
      label: t("sidebar.landlord.messages"),
      path: "/message",
    },
    { icon: User, label: t("sidebar.landlord.profile"), path: "/profile" },
  ];

  const tenantMenuItems = [
    {
      icon: BarChart3,
      label: t("sidebar.tenant.dashboard"),
      path: "/dashboard",
    },
    { icon: Home, label: t("sidebar.tenant.myBookings"), path: "/my-bookings" },
    {
      icon: Contact,
      label: t("sidebar.tenant.contracts"),
      path: "/my-contracts",
    },
    {
      icon: DollarSign,
      label: t("sidebar.tenant.bills"),
      path: "/unified-bills",
    },
    {
      icon: MessageSquare,
      label: t("sidebar.tenant.messages"),
      path: "/message",
    },
    { icon: User, label: t("sidebar.tenant.profile"), path: "/profile" },
  ];

  const menuItems = useMemo(() => {
    return activeRole === "landlord" ? landlordMenuItems : tenantMenuItems;
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
      <div className="w-10 h-10 bg-gradient-to-br from-[#CC6F4A] to-[#A85A3A] rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {initial.toUpperCase()}
        </span>
      </div>
    );
  };

  const roleBadge =
    activeRole === "landlord"
      ? { label: t("dashboard.landlordRole"), color: "bg-[#CC6F4A]" }
      : { label: t("dashboard.tenantRole"), color: "bg-emerald-600" };

  /* =========================
   * RENDER
   * ========================= */
  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } fixed left-0 top-0 z-50 h-dvh overflow-hidden border-r border-[#E8D8C7] bg-gradient-to-b from-[#1F1D1A] via-[#2A2723] to-[#1C1A17] text-white transition-all duration-300`}
    >
      <div className="h-full p-5 flex flex-col">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CC6F4A] rounded-xl flex items-center justify-center shadow-[0_8px_18px_rgba(204,111,74,0.35)]">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Roomie</h1>
            <p className="text-xs text-[#D5C4AF]">dashboard workspace</p>
          </div>
        </div>

        {/* Profile + Role Badge */}
        <div className="mb-6 rounded-2xl border border-[#4A433A] bg-[#2F2A24]/70 p-3.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#C9B6A2]">Profile</p>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${roleBadge.color}`}
            >
              {roleBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {renderAvatar()}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {displayUser?.fullName || "User"}
              </p>
              <p className="text-xs text-[#C9B6A2] truncate">
                {displayUser?.email || "No email"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1.5 overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                isActive(item.path)
                  ? "bg-[#CC6F4A] text-white shadow-[0_8px_18px_rgba(204,111,74,0.35)]"
                  : "text-[#F5E9DB] hover:bg-[#3A342D]"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-[#4A433A] mt-4">
          <p className="text-xs text-[#C9B6A2] text-center">© 2026 Roomie</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
