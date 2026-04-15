/* aria-label */
// src/components/layout/layoutAdmin/AdminSidebar.jsx
import React from "react";
import { Home, Building, Users, CalendarCheck, FileText, ScrollText, Settings, LogOut, Receipt, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ activeMenu, setActiveMenu, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuGroups = [
    {
      label: "Tổng quan",
      items: [
        { icon: Home, label: "Admin Dashboard", path: "/admin/dashboard" },
      ],
    },
    {
      label: "Quản lý",
      items: [
        { icon: Building, label: "Bất động sản", path: "/admin/properties" },
        { icon: Users, label: "Người dùng", path: "/admin/users" },
        { icon: CalendarCheck, label: "Đặt phòng", path: "/admin/bookings" },
        { icon: FileText, label: "Hợp đồng", path: "/admin/contracts" },
        { icon: Receipt, label: "Hóa đơn", path: "/admin/billing" },
      ],
    },
    {
      label: "Hệ thống",
      items: [
        { icon: BarChart3, label: "Báo cáo", path: "/admin/reports" },
        { icon: ScrollText, label: "Nhật ký", path: "/admin/logs" },
        { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
      ],
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
        className="h-full border-r flex flex-col"
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

        {/* Menu Groups */}
        <div className="p-4 flex-1 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2 px-4"
                style={{ color: "rgba(217, 200, 181, 0.45)" }}
              >
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 mb-1"
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
                    <Icon className="w-[18px] h-[18px]" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 mt-auto">
          <div className="pt-4 border-t" style={{ borderColor: "rgba(217, 200, 181, 0.15)" }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              type="button"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
