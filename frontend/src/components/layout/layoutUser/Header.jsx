// web-app/src/components/layout/layoutUser/Header.jsx
import {
  Menu as MenuLucide,
  X,
  RefreshCw,
  Bell,
  LogOut,
  Moon,
  Sun,
  Home,
  UserCircle,
  Globe,
} from "lucide-react";

import { useTranslation } from "react-i18next";

import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../../../contexts/RoleContext";
import { useRefresh } from "../../../contexts/RefreshContext";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import NotificationDropdown from "../../domain/notification/NotificationDropdown";
import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { removeToken } from "../../../services/localStorageService";
import { useUser } from "../../../contexts/UserContext";
import "../../../styles/apple-glass-dashboard.css";
import "../../../styles/home-redesign.css";

const Header = ({ sidebarOpen, setSidebarOpen, pageTitle, pageSubtitle }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole, switchRole } = useRole();
  const { triggerRefresh, isRefreshing } = useRefresh();
  const { unreadCount } = useNotificationContext();
  const { user } = useUser();

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const menuBtnRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  const openMenu = Boolean(anchorEl);
  const openNotifications = Boolean(notificationAnchor);

  // User info
  const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  };

  const getUsername = () => {
    const user = getStoredUser();
    const fromUser =
      user?.username || user?.userName || user?.name || user?.email || "";
    const fromKey = localStorage.getItem("username");
    return (fromUser || fromKey || "").toString().trim();
  };

  const username = getUsername();
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    username?.toLowerCase() === "admin";
  const currentLanguage = i18n.language || "en";

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  ];

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

  // Handlers
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenNotifications = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleDashboardClick = () => {
    handleCloseMenu();
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    removeToken();
    handleCloseMenu();
    navigate("/login");
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
    handleCloseMenu();
  };

  const handleThemeToggle = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { darkMode: newTheme } }),
    );
  };

  const handleRoleChange = (role) => {
    switchRole(role);
    handleCloseMenu();
  };

  const getPageKey = () => {
    const path = location.pathname;
    if (path.includes("add-property")) {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get("edit");
      return editId ? "add-property" : null;
    }
    if (path.includes("dashboard")) return "dashboard";
    if (path.includes("my-properties")) return "my-properties";
    if (path.includes("my-bookings")) return "my-bookings";
    if (path.includes("my-contracts") || path.includes("contract"))
      return "my-contracts";
    if (path.includes("bill")) return "bills";
    if (path.includes("message")) return "messages";
    if (path.includes("profile")) return "profile";
    return null;
  };

  const handleRefresh = () => {
    const pageKey = getPageKey();
    if (pageKey) {
      triggerRefresh(pageKey);
    }
  };

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
      <div className="home-glass-card relative overflow-hidden rounded-2xl">
        <div className="relative flex items-start justify-between gap-3 px-3 py-3 md:px-5 md:py-3.5">
          {/* Left side - Sidebar toggle + Refresh + Optional page heading */}
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="home-glass-soft rounded-xl p-2 text-[#2B2A28] transition"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-[#2B2A28]" />
              ) : (
                <MenuLucide className="w-5 h-5 text-[#2B2A28]" />
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`home-glass-soft rounded-xl p-2 text-[#2B2A28] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isRefreshing ? "animate-pulse" : ""
              }`}
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-5 h-5 text-[#2B2A28] ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>

            {pageTitle && (
              <div className="ml-1 min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-[#2F2A25] md:text-base">
                  {pageTitle}
                </p>
                {pageSubtitle && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-[#765842] md:text-sm">
                    {pageSubtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button type="button" onClick={handleOpenNotifications}
              className="apple-glass-pill relative flex h-10 w-10 items-center justify-center rounded-full transition hover:shadow-md"
            >
              <Bell size={20} className="text-[var(--home-charcoal)]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown anchorEl={notificationAnchor} open={openNotifications} onClose={handleCloseNotifications} />

            {/* User Email Button */}
            <button type="button" ref={menuBtnRef} onClick={handleOpenMenu}
              className="apple-glass-pill flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:shadow-md"
            >
              {displayUser?.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.username} className="w-7 h-7 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--home-accent-strong)" }}>
                  {(displayUser?.fullName?.[0] || displayUser?.username?.[0] || "U").toUpperCase()}
                </span>
              )}
              <span className="hidden md:block text-sm font-semibold text-[var(--home-charcoal)] max-w-[180px] truncate">
                {displayUser?.email || displayUser?.username || "User"}
              </span>
            </button>

            {/* Liquid Glass Dropdown — rendered via portal */}
            {openMenu && createPortal(
              <div className="home-v2">
                <div className="fixed inset-0 z-[9998]" onClick={handleCloseMenu} />
                <div className="fixed z-[9999] w-72 rounded-2xl p-2 animate-[menuIn_0.18s_ease-out]"
                  style={{
                    top: menuBtnRef.current ? menuBtnRef.current.getBoundingClientRect().bottom + 8 : 60,
                    right: 16,
                    background: "linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 50%, rgba(255,250,245,0.56) 100%)",
                    backdropFilter: "blur(48px) saturate(200%)",
                    WebkitBackdropFilter: "blur(48px) saturate(200%)",
                    border: "0.5px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 24px 48px rgba(35,32,28,0.12), 0 8px 16px rgba(35,32,28,0.06), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.04)",
                  }}>
                  <style>{`@keyframes menuIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-1">
                    {displayUser?.avatar ? (
                      <img src={displayUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white/40"
                        style={{ background: "linear-gradient(135deg, var(--home-accent), var(--home-accent-strong))" }}>
                        {(displayUser?.fullName?.[0] || displayUser?.username?.[0] || "U").toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--home-charcoal)] truncate">{displayUser?.fullName || displayUser?.username}</p>
                      <p className="text-xs text-[var(--home-muted)] truncate">{displayUser?.email}</p>
                    </div>
                  </div>
                  <div className="h-px mx-2 mb-2" style={{ background: "linear-gradient(90deg, transparent, var(--home-border), transparent)" }} />

                  {/* Role Cards */}
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--home-muted)]">Vai trò</p>
                  <div className="grid grid-cols-2 gap-1.5 px-2 mb-2">
                    <button type="button" onClick={() => handleRoleChange("landlord")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-200 ${
                        activeRole === "landlord"
                          ? "bg-gradient-to-b from-[var(--home-accent)] to-[#c98a4a] text-[var(--home-charcoal)] shadow-md ring-1 ring-white/30"
                          : "bg-white/40 text-[var(--home-muted)] hover:bg-white/60 hover:text-[var(--home-charcoal)]"}`}>
                      <Home size={18} />Landlord
                    </button>
                    <button type="button" onClick={() => handleRoleChange("tenant")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-200 ${
                        activeRole === "tenant"
                          ? "bg-gradient-to-b from-[var(--home-accent)] to-[#c98a4a] text-[var(--home-charcoal)] shadow-md ring-1 ring-white/30"
                          : "bg-white/40 text-[var(--home-muted)] hover:bg-white/60 hover:text-[var(--home-charcoal)]"}`}>
                      <UserCircle size={18} />Tenant
                    </button>
                  </div>
                  <div className="h-px mx-2 mb-2" style={{ background: "linear-gradient(90deg, transparent, var(--home-border), transparent)" }} />

                  {/* Language Pills */}
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--home-muted)]">Ngôn ngữ</p>
                  <div className="flex gap-1.5 px-2 mb-2">
                    {languages.map((lang) => (
                      <button key={lang.code} type="button" onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                          currentLanguage === lang.code
                            ? "bg-gradient-to-b from-[var(--home-accent)] to-[#c98a4a] text-[var(--home-charcoal)] shadow-md ring-1 ring-white/30"
                            : "bg-white/40 text-[var(--home-muted)] hover:bg-white/60 hover:text-[var(--home-charcoal)]"}`}>
                        <Globe size={14} />{lang.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-px mx-2 mb-1" style={{ background: "linear-gradient(90deg, transparent, var(--home-border), transparent)" }} />

                  {/* Action Buttons */}
                  <button type="button" onClick={handleThemeToggle}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--home-charcoal)] transition hover:bg-white/50">
                    {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
                    {darkMode ? "Light mode" : "Dark mode"}
                  </button>
                  <button type="button" onClick={() => { handleCloseMenu(); navigate("/"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--home-charcoal)] transition hover:bg-white/50">
                    <Home size={16} className="text-sky-600" />Trang chủ
                  </button>
                  <div className="h-px mx-2 my-1" style={{ background: "linear-gradient(90deg, transparent, var(--home-border), transparent)" }} />
                  <button type="button" onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50/60">
                    <LogOut size={16} />{t("common.logout") || "Đăng xuất"}
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
