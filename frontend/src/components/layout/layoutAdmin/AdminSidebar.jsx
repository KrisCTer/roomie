// src/components/layout/layoutAdmin/AdminSidebar.jsx
import React from "react";
import { Home, Building, Users, User, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ activeMenu, setActiveMenu, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: "Admin Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: Building,
      label: "Admin Properties",
      path: "/admin/properties",
    },
    {
      icon: Users,
      label: "User Management",
      path: "/admin/users",
    },
  ];

  const isActive = (item) => {
    if (activeMenu && item.label === activeMenu) return true;
    return location.pathname === item.path;
  };

  const handleNavigate = (item) => {
    setActiveMenu?.(item.label);
    navigate(item.path);
  };

  const handleLogout = () => {
    // xoá các key phổ biến (tuỳ dự án bạn có thể đang dùng key khác)
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("username");

    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300
      ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}
    >
      <div className="h-full bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800">
        {/* Brand */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">
              Roomie
            </div>
            <div className="text-slate-400 text-xs">Admin Panel</div>
          </div>
        </div>

        {/* Admin Card */}
        <div className="px-6">
          <div className="text-slate-400 text-xs mb-2">Admin</div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold truncate">
                Administrator
              </div>
              <div className="text-slate-400 text-sm truncate">admin</div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-800" />
        </div>

        {/* Menu */}
        <div className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2
                  ${
                    active
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-200 hover:bg-slate-800/60"
                  }`}
                type="button"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              type="button"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
