import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home as HomeIcon,
  LogOut,
  Menu,
  X,
  UserCircle,
  Globe,
  Moon,
  Sun,
  LayoutDashboard,
} from "lucide-react";
import {
  getCompleteUserInfo,
  isAuthenticated,
  removeToken,
} from "../../../services/localStorageService";

const EditorialHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const loggedIn = isAuthenticated();
  const user = getCompleteUserInfo();
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.username?.toLowerCase() === "admin";
  const dashboardPath = isAdmin ? "/admin/dashboard" : "/dashboard";
  const currentLanguage = i18n.language || "en";

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  const languages = [
    { code: "en", label: "English" },
    { code: "vi", label: "Tiếng Việt" },
  ];

  const isHomeActive =
    location.pathname === "/" || location.pathname === "/home";
  const isSearchActive = location.pathname.startsWith("/search");
  const isFavoritesActive = location.pathname.startsWith("/my-favorites");
  const isProfileActive = location.pathname.startsWith(
    `/user/${user?.userId || ""}`,
  );
  const myProfilePath = user?.userId ? `/user/${user.userId}` : "/login";

  const handleNavigate = (path) => {
    setIsOpen(false);
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    removeToken();
    setMenuOpen(false);
    navigate("/login");
  };

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
  };

  const handleThemeToggle = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { darkMode: newTheme } }),
    );
  };

  const displayName = user?.email || user?.username || "User";
  const initial = (
    user?.firstName?.[0] ||
    user?.username?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--home-border)] bg-[var(--home-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNavigate("/")}
          className="group flex items-center gap-2 rounded-md px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
          aria-label="Go to home"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--home-accent)] text-[var(--home-charcoal)]">
            <HomeIcon size={18} />
          </span>
          <div>
            <p className="home-logo">ROOMIE</p>
            <p className="text-xs text-[var(--home-muted)]">
              real homes, real fit
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className={`home-nav-link ${isHomeActive ? "is-active" : ""}`}
          >
            {t("common.home")}
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/search")}
            className={`home-nav-link ${isSearchActive ? "is-active" : ""}`}
          >
            {t("common.search")}
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/my-favorites")}
            className={`home-nav-link ${isFavoritesActive ? "is-active" : ""}`}
          >
            {t("Favorites") || t("common.search")}
          </button>
          {loggedIn && (
            <button
              type="button"
              onClick={() => handleNavigate(myProfilePath)}
              className={`home-nav-link ${isProfileActive ? "is-active" : ""}`}
            >
              {t("common.profile") || t("Profile")}
            </button>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <button
              type="button"
              ref={menuBtnRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[var(--home-border)] px-3 py-1.5 text-sm font-semibold text-[var(--home-charcoal)] transition hover:bg-[var(--home-surface-soft)] hover:shadow-sm"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--home-accent-strong)" }}
                >
                  {initial}
                </span>
              )}
              <span className="max-w-[180px] truncate">{displayName}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate("/login")}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--home-charcoal)] px-5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
            >
              {t("common.login")}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--home-border)] text-[var(--home-charcoal)] md:hidden"
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-[var(--home-border)] bg-[var(--home-surface)] p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className={`home-mobile-link ${isHomeActive ? "is-active" : ""}`}
            >
              {t("common.home")}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/search")}
              className={`home-mobile-link ${isSearchActive ? "is-active" : ""}`}
            >
              {t("common.search")}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/my-favorites")}
              className={`home-mobile-link ${isFavoritesActive ? "is-active" : ""}`}
            >
              {t("Favorites") || t("common.search")}
            </button>
            {loggedIn && (
              <button
                type="button"
                onClick={() => handleNavigate(myProfilePath)}
                className={`home-mobile-link ${isProfileActive ? "is-active" : ""}`}
              >
                {t("common.profile") || t("Profile")}
              </button>
            )}
            {loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="home-mobile-link"
              >
                {t("common.logout")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className="home-mobile-link"
              >
                {t("common.login")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Liquid Glass Dropdown — portal */}
      {menuOpen &&
        loggedIn &&
        createPortal(
          <div className="home-v2">
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="fixed z-[9999] w-72 rounded-2xl p-2 animate-[menuIn_0.18s_ease-out]"
              style={{
                top: menuBtnRef.current
                  ? menuBtnRef.current.getBoundingClientRect().bottom + 8
                  : 60,
                right: Math.max(
                  16,
                  window.innerWidth -
                    (menuBtnRef.current?.getBoundingClientRect().right ||
                      window.innerWidth) +
                    0,
                ),
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 50%, rgba(255,250,245,0.56) 100%)",
                backdropFilter: "blur(48px) saturate(200%)",
                WebkitBackdropFilter: "blur(48px) saturate(200%)",
                border: "0.5px solid rgba(255,255,255,0.55)",
                boxShadow:
                  "0 24px 48px rgba(35,32,28,0.12), 0 8px 16px rgba(35,32,28,0.06), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.04)",
              }}
            >
              <style>{`@keyframes menuIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-3 mb-1">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white/40"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--home-accent), var(--home-accent-strong))",
                    }}
                  >
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--home-charcoal)] truncate">
                    {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                      user?.username}
                  </p>
                  <p className="text-xs text-[var(--home-muted)] truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div
                className="h-px mx-2 mb-2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--home-border), transparent)",
                }}
              />

              {/* Dashboard */}
              <button
                type="button"
                onClick={() => handleNavigate(dashboardPath)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--home-charcoal)] transition hover:bg-white/50"
              >
                <LayoutDashboard
                  size={16}
                  className="text-[var(--home-accent-strong)]"
                />
                {t("headerMenu.dashboard")}
              </button>
              <div
                className="h-px mx-2 my-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--home-border), transparent)",
                }}
              />

              {/* Language */}
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--home-muted)]">
                {t("headerMenu.language")}
              </p>
              <div className="flex gap-1.5 px-2 mb-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      currentLanguage === lang.code
                        ? "bg-gradient-to-b from-[var(--home-accent)] to-[#c98a4a] text-[var(--home-charcoal)] shadow-md ring-1 ring-white/30"
                        : "bg-white/40 text-[var(--home-muted)] hover:bg-white/60 hover:text-[var(--home-charcoal)]"
                    }`}
                  >
                    <Globe size={14} />
                    {lang.label}
                  </button>
                ))}
              </div>
              <div
                className="h-px mx-2 mb-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--home-border), transparent)",
                }}
              />

              {/* Dark mode */}
              <button
                type="button"
                onClick={handleThemeToggle}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--home-charcoal)] transition hover:bg-white/50"
              >
                {darkMode ? (
                  <Sun size={16} className="text-amber-500" />
                ) : (
                  <Moon size={16} className="text-indigo-500" />
                )}
                {darkMode
                  ? t("headerMenu.light") + " mode"
                  : t("headerMenu.dark") + " mode"}
              </button>
              <div
                className="h-px mx-2 my-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--home-border), transparent)",
                }}
              />

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50/60"
              >
                <LogOut size={16} />
                {t("common.logout") || "Đăng xuất"}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
};

export default EditorialHeader;
