import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home as HomeIcon, LogOut, Menu, User, X } from "lucide-react";
import {
  getCompleteUserInfo,
  isAuthenticated,
  removeToken,
} from "../../../services/localStorageService";

const EditorialHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const loggedIn = isAuthenticated();
  const user = getCompleteUserInfo();

  const isHomeActive =
    location.pathname === "/" || location.pathname === "/home";
  const isSearchActive = location.pathname.startsWith("/search");
  const isFavoritesActive = location.pathname.startsWith("/my-favorites");

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

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
            {t("Favorites")}
          </button>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigate("/dashboard")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--home-border)] px-4 text-sm font-semibold text-[var(--home-charcoal)] transition hover:bg-[var(--home-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
              >
                <User size={16} />
                {user?.username || t("common.profile")}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--home-charcoal)] px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-focus)]"
              >
                <LogOut size={16} />
                {t("common.logout")}
              </button>
            </>
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
              {t("Favorites")}
            </button>
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
    </header>
  );
};

export default EditorialHeader;
