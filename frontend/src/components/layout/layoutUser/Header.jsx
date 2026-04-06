// web-app/src/components/layout/layoutUser/Header.jsx
import {
  Menu as MenuLucide,
  X,
  RefreshCw,
  Bell,
  LayoutDashboard,
  User,
  LogOut,
  Moon,
  Sun,
  Home,
  UserCircle,
  Globe,
} from "lucide-react";
import {
  IconButton,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../../../contexts/RoleContext";
import { useRefresh } from "../../../contexts/RefreshContext";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import NotificationDropdown from "../../domain/notification/NotificationDropdown";
import { useState, useMemo } from "react";
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
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Notification Bell */}
            <IconButton
              onClick={handleOpenNotifications}
              className="apple-glass-pill"
              sx={{
                color: "#2B2A28",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  transform: "scale(1.05)",
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.65rem",
                    height: 18,
                    minWidth: 18,
                    fontWeight: 700,
                  },
                }}
              >
                <Bell size={20} />
              </Badge>
            </IconButton>

            {/* Notification Dropdown */}
            <NotificationDropdown
              anchorEl={notificationAnchor}
              open={openNotifications}
              onClose={handleCloseNotifications}
            />

            {/* User Menu Button */}
            <Paper
              className="apple-glass-pill"
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 999,
                px: 1.5,
                py: 0.5,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: "0 8px 18px rgba(101, 73, 46, 0.16)",
                  bgcolor: "rgba(255,255,255,0.25)",
                },
              }}
              onClick={handleOpenMenu}
            >
              <MenuIcon
                sx={{ fontSize: 20, color: "grey.700" }}
                className="dark:text-dark-primary"
              />
              {displayUser?.avatar ? (
                <Avatar
                  src={displayUser.avatar}
                  alt={displayUser.username}
                  sx={{
                    width: 32,
                    height: 32,
                  }}
                  imgProps={{
                    onError: (e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                    },
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  {(
                    displayUser?.fullName?.[0] ||
                    displayUser?.username?.[0] ||
                    "U"
                  ).toUpperCase()}
                </Avatar>
              )}
            </Paper>

            {/* Enhanced User Menu with Settings */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              PaperProps={{
                elevation: 3,
                className: "dark:bg-dark-secondary",
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 280,
                  "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1.5,
                    fontSize: "0.875rem",
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box
                sx={{ px: 2, py: 1, bgcolor: "grey.50" }}
                className="dark:bg-dark-tertiary"
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "grey.600",
                    textTransform: "uppercase",
                  }}
                  className="dark:text-dark-secondary"
                >
                  Vai trò
                </Typography>
              </Box>

              <MenuItem
                onClick={() => handleRoleChange("landlord")}
                selected={activeRole === "landlord"}
                className="dark:hover:bg-dark-hover"
                sx={{
                  bgcolor:
                    activeRole === "landlord" ? "primary.light" : "transparent",
                }}
              >
                <ListItemIcon>
                  <Home size={18} className="text-[#CC6F4A]" />
                </ListItemIcon>
                <ListItemText
                  primary="Landlord"
                  secondary="Quản lý tài sản, hợp đồng"
                  sx={{
                    "& .MuiListItemText-secondary": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </MenuItem>

              <MenuItem
                onClick={() => handleRoleChange("tenant")}
                selected={activeRole === "tenant"}
                className="dark:hover:bg-dark-hover"
                sx={{
                  bgcolor:
                    activeRole === "tenant" ? "primary.light" : "transparent",
                }}
              >
                <ListItemIcon>
                  <UserCircle size={18} className="text-[#CC6F4A]" />
                </ListItemIcon>
                <ListItemText
                  primary="Tenant"
                  secondary="Tìm phòng, quản lý đặt chỗ"
                  sx={{
                    "& .MuiListItemText-secondary": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
              </MenuItem>

              <Divider sx={{ my: 1 }} className="dark:border-dark-primary" />

              {/* Become a Tenant */}
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  navigate("/");
                }}
                className="dark:hover:bg-dark-hover"
              >
                <ListItemIcon>
                  <UserCircle size={18} className="text-blue-600" />
                </ListItemIcon>
                <ListItemText
                  primary="Become a Tenant"
                  secondary="Find rooms, manage bookings"
                  className="dark:text-dark-primary"
                  sx={{
                    "& .MuiListItemText-secondary": {
                      fontSize: "0.75rem",
                    },
                  }}
                  classes={{
                    secondary: "dark:text-dark-secondary",
                  }}
                />
              </MenuItem>

              <Divider sx={{ my: 1 }} className="dark:border-dark-primary" />

              {/* Language Selection */}
              <Box
                sx={{ px: 2, py: 1, bgcolor: "grey.50" }}
                className="dark:bg-dark-tertiary"
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "grey.600",
                    textTransform: "uppercase",
                  }}
                  className="dark:text-dark-secondary"
                >
                  Language / Ngôn ngữ
                </Typography>
              </Box>
              {languages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  selected={currentLanguage === lang.code}
                  className="dark:hover:bg-dark-hover"
                  sx={{
                    bgcolor:
                      currentLanguage === lang.code
                        ? "primary.light"
                        : "transparent",
                  }}
                >
                  <ListItemIcon>
                    <Globe size={18} className="dark:text-dark-primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={lang.label}
                    className="dark:text-dark-primary"
                    sx={{
                      "& .MuiTypography-root": {
                        fontWeight: currentLanguage === lang.code ? 600 : 400,
                      },
                    }}
                  />
                  {currentLanguage === lang.code && (
                    <Typography fontSize="1.25rem" className="ml-2">
                      {lang.flag}
                    </Typography>
                  )}
                </MenuItem>
              ))}

              <Divider sx={{ my: 1 }} className="dark:border-dark-primary" />

              {/* Theme Toggle */}
              <MenuItem
                onClick={handleThemeToggle}
                className="dark:hover:bg-dark-hover"
              >
                <ListItemIcon>
                  {darkMode ? (
                    <Sun size={18} className="text-yellow-500" />
                  ) : (
                    <Moon size={18} className="text-indigo-600" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={darkMode ? "Light mode" : "Dark mode"}
                  className="dark:text-dark-primary"
                />
              </MenuItem>

              <Divider sx={{ my: 1 }} className="dark:border-dark-primary" />

              {/* Logout */}
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "error.main",
                }}
                className="dark:hover:bg-dark-hover"
              >
                <ListItemIcon>
                  <LogOut size={18} className="text-red-600" />
                </ListItemIcon>
                <ListItemText
                  primary={t("common.logout") || "Logout"}
                  sx={{ color: "error.main" }}
                />
              </MenuItem>
            </Menu>
          </Stack>
        </div>
      </div>
    </header>
  );
};

export default Header;
