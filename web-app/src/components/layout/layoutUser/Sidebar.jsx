import {
  Home,
  User,
  BarChart3,
  Building,
  MessageSquare,
  Plus,
  LogOut,
  Contact,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Sidebar = ({ activeMenu, setActiveMenu, sidebarOpen }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const menuItems = [
    { icon: BarChart3, label: t("Dashboards"), path: "/dashboard" },
    { icon: User, label: t("Profile"), path: "/profile" },
    // { icon: Star, label: t("Reviews"), path: "/reviews" },
    { icon: Building, label: t("My Properties"), path: "/my-properties" },
    { icon: Contact, label: t("Contracts"), path: "/contract-signing" },
    { icon: MessageSquare, label: t("Message"), path: "/Message" },
    { icon: Plus, label: t("Add Property"), path: "/add-property" },
    { icon: LogOut, label: t("Logout"), path: "/logout" },
  ];

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

        {/* Profile */}
        <div className="mb-8 pb-6 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-3">Profile</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Account</p>
              <p className="text-xs text-gray-400">themesflat@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveMenu(item.label);
                navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                activeMenu === item.label ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
