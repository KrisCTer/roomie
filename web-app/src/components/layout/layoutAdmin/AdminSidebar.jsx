import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Home,
} from "lucide-react";

const AdminSidebar = ({ activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      id: "properties",
      label: "Manage Properties",
      icon: <ClipboardList size={20} />,
      path: "/admin/properties",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-lg flex flex-col">
      
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-700">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Home size={26} className="text-blue-400" />
          Roomie Admin
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 mt-4">
        {menuItems.map((menu) => (
          <NavLink
            key={menu.id}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors
              ${isActive || activeMenu === menu.id
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
            onClick={() => setActiveMenu(menu.id)}
          >
            {menu.icon}
            <span className="text-md">{menu.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-400 hover:text-red-300"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
