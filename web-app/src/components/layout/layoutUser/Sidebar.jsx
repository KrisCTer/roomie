// src/components/layout/layoutUser/Sidebar.jsx
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Services
import { getCompleteUserInfo } from "../../../services/localStorageService";
import { getMyProfile } from "../../../services/user.service";

const Sidebar = ({ activeMenu, setActiveMenu, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // ✅ State for current user
  const [currentUser, setCurrentUser] = useState({
    username: "",
    email: "",
    avatar: "",
    fullName: "",
  });

  const menuItems = [
    { icon: BarChart3, label: t("Dashboards"), path: "/dashboard" },
    { icon: User, label: t("Profile"), path: "/profile" },
    { icon: Building, label: t("My Properties"), path: "/my-properties" },
    { icon: BookOpen, label: t("My Bookings"), path: "/my-bookings" },
    { icon: Plus, label: t("Add Property"), path: "/add-property" },
    { icon: Contact, label: t("Contracts"), path: "/my-contracts" },
    { icon: MessageSquare, label: t("Message"), path: "/message" },
    { icon: Zap, label: t("Utility Config"), path: "/utility-config" },
    { icon: FileText, label: t("My Bills"), path: "/unified-bills" },
    { icon: LogOut, label: t("Logout"), path: "/logout" },
  ];

  // ✅ Load user info on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // Method 1: Get from localStorage
      const userInfo = getCompleteUserInfo();

      if (userInfo) {
        setCurrentUser({
          username: userInfo.username || "User",
          email: userInfo.email || "",
          avatar: userInfo.avatar || "",
          fullName:
            `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() ||
            userInfo.username,
        });

        // Method 2: Fetch latest profile from API (optional, for fresh data)
        try {
          const profileResponse = await getMyProfile();
          const profile =
            profileResponse?.result || profileResponse?.data?.result;

          if (profile) {
            setCurrentUser({
              username: profile.username || userInfo.username,
              email: profile.email || userInfo.email,
              avatar: profile.avatar || userInfo.avatar,
              fullName:
                `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
                profile.username,
            });
          }
        } catch (apiError) {
          // If API fails, keep localStorage data
          console.log("Using cached user data from localStorage");
        }
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  const handleNavigation = (item) => {
    setActiveMenu(item.label);

    // Special handling for Logout
    if (item.path === "/logout") {
      handleLogout();
      return;
    }

    // Admin route override
    const username = localStorage.getItem("username");
    if (username === "admin") {
      if (item.label === t("Dashboards")) {
        navigate("/admin/dashboard");
        return;
      }
      if (item.label === t("My Properties")) {
        navigate("/admin/properties");
        return;
      }
    }

    navigate(item.path);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();

    // Navigate to login
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ✅ Get avatar display
  const getAvatarDisplay = () => {
    if (currentUser.avatar) {
      return (
        <img
          src={currentUser.avatar}
          alt={currentUser.username}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextElementSibling.style.display = "flex";
          }}
        />
      );
    }

    // Fallback to initial
    const initial =
      currentUser.fullName?.[0] || currentUser.username?.[0] || "U";
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {initial.toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } bg-slate-900 text-white transition-all duration-300 overflow-hidden fixed left-0 top-0 h-full z-50`}
    >
      <div className="p-6">
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

        {/* Profile - ✅ Updated with current user */}
        <div className="mb-8 pb-6 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-3">Profile</p>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {getAvatarDisplay()}

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentUser.fullName || currentUser.username || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser.email || "No email"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path) ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
