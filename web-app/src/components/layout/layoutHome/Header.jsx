// web-app/src/components/layout/layoutHome/Header.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isAuthenticated,
  removeToken,
} from "../../../services/localStorageService";
import SettingsMenu from "../../common/SettingsMenu";

export default function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loggedIn = isAuthenticated();

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    removeToken();
    handleCloseMenu();
    navigate("/login");
  };

  // Lấy user từ localStorage, dùng chung cho avatar + điều hướng dashboard
  const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Cannot parse user from localStorage:", e);
      return null;
    }
  };

  const getUsername = () => {
    const user = getStoredUser();

    // 1) ưu tiên lấy từ object user (nếu có)
    const fromUser =
      user?.username || user?.userName || user?.name || user?.email;

    // 2) fallback: lấy từ key "username" (trường hợp của bạn)
    const fromKey = localStorage.getItem("username");

    return (fromUser || fromKey || "").toString().trim();
  };

  // Điều hướng dashboard theo username
  const handleDashboardClick = () => {
    const username = getUsername().toLowerCase();

    // Debug nếu cần
    console.log("Dashboard click, username =", username);

    if (username === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const username = getUsername();
  const isAdmin = username?.toLowerCase() === "admin";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(11,27,42,0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(148,163,184,0.2)",
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mr: 4, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Roomie
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mr: "auto" }}>
          <Button
            color="inherit"
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderBottom: "2px solid white",
              borderRadius: 0,
              px: 0,
            }}
          >
            {t("common.properties")}
          </Button>
        </Box>

        {/* Right side */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Settings Menu */}
          <SettingsMenu />

          {!loggedIn ? (
            <>
              {/* Khi CHƯA đăng nhập */}
              <Button
                color="inherit"
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/dashboard")}
              >
                {t("header.becomeHost")}
              </Button>

              <Button
                color="inherit"
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/login")}
              >
                {t("common.login")}
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  borderRadius: 999,
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#2563eb",
                }}
              >
                {t("common.register")}
              </Button>
            </>
          ) : (
            <>
              {/* Khi ĐÃ đăng nhập */}
              <IconButton onClick={handleOpenMenu}>
                <Avatar sx={{ bgcolor: "#2563eb" }}>
                  {username ? username[0].toUpperCase() : "U"}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.2,
                    borderRadius: 2,
                    minWidth: 180,
                  },
                }}
              >
                {!isAdmin && (
                  <MenuItem
                    onClick={() => {
                      handleCloseMenu();
                      navigate("/profile");
                    }}
                  >
                    {t("header.myProfile")}
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    handleDashboardClick();
                  }}
                >
                  {t("header.hostDashboard")}
                </MenuItem>

                <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                  {t("common.logout")}
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Mobile menu icon */}
          <IconButton
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: 1 }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
