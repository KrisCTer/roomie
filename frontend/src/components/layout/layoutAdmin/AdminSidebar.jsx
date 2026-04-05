/* aria-label */
// src/components/layout/layoutAdmin/AdminSidebar.jsx
import React from "react";
import { Home, Building, Users, LogOut } from "lucide-react";
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
      <div
        className="h-full border-r"
        style={{
          background: "linear-gradient(180deg, var(--home-charcoal) 0%, #1a1714 100%)",
          borderColor: "rgba(217, 200, 181, 0.15)",
        }}
      >
        {/* Brand */}
        <div className="p-6 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: "var(--home-accent-strong)" }}
          >
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Roomie
            </div>
            <div style={{ color: "var(--home-border)" }} className="text-xs">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Admin Card */}
        <div className="px-6">
          <div style={{ color: "var(--home-border)" }} className="text-xs mb-2">
            Admin
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "rgba(216, 154, 91, 0.2)" }}
            >
              <Users className="w-6 h-6" style={{ color: "var(--home-accent)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold truncate">
                Administrator
              </div>
              <div style={{ color: "var(--home-border)" }} className="text-sm truncate">
                admin
              </div>
            </div>
          </div>
          <div className="mt-4 border-t" style={{ borderColor: "rgba(217, 200, 181, 0.15)" }} />
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2`}
                style={
                  active
                    ? {
                        background: "var(--home-accent-strong)",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(184, 104, 47, 0.3)",
                      }
                    : {
                        color: "rgba(255, 255, 255, 0.75)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
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
          <div className="pt-4 border-t" style={{ borderColor: "rgba(217, 200, 181, 0.15)" }}>
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
