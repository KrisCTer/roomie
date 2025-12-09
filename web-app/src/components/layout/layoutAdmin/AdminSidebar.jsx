import React from "react";
import { Home, Building, Users, Circle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ activeMenu, setActiveMenu, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
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
    {
      icon: Circle,
      label: "",        // nút để trống, không có text
      path: "",
      disabled: true,   // không cho click
    },
  ];

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item) => {
    if (item.disabled || !item.path) return;
    setActiveMenu(item.label);
    navigate(item.path);
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
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Profile */}
        <div className="mb-8 pb-6 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-3">Admin</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-gray-400">admin</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleNavigation(item)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  item.disabled
                    ? "opacity-40 cursor-default"
                    : isActive(item.path)
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
