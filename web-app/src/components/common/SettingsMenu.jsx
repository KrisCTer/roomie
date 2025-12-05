// web-app/src/components/common/SettingsMenu.jsx
import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Brightness4 as SystemIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";

const SettingsMenu = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenu, setSubMenu] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubMenu(null);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    handleClose();
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    handleClose();
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <LightModeIcon />;
      case "dark":
        return <DarkModeIcon />;
      default:
        return <SystemIcon />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 1 }}
        aria-label="settings"
      >
        <SettingsIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        {/* Language Section */}
        <Box px={2} py={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {t("common.language")}
          </Typography>
        </Box>

        <MenuItem onClick={() => handleLanguageChange("vi")}>
          <ListItemIcon>
            {i18n.language === "vi" && <CheckIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            <Box display="flex" alignItems="center" gap={1}>
              <span>🇻🇳</span>
              <span>Tiếng Việt</span>
            </Box>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleLanguageChange("en")}>
          <ListItemIcon>
            {i18n.language === "en" && <CheckIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            <Box display="flex" alignItems="center" gap={1}>
              <span>🇬🇧</span>
              <span>English</span>
            </Box>
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* Theme Section */}
        <Box px={2} py={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {t("common.theme")}
          </Typography>
        </Box>

        <MenuItem onClick={() => handleThemeChange("light")}>
          <ListItemIcon>
            {theme === "light" ? (
              <CheckIcon fontSize="small" />
            ) : (
              <LightModeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{t("common.light")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleThemeChange("dark")}>
          <ListItemIcon>
            {theme === "dark" ? (
              <CheckIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{t("common.dark")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleThemeChange("system")}>
          <ListItemIcon>
            {theme === "system" ? (
              <CheckIcon fontSize="small" />
            ) : (
              <SystemIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{t("common.system")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SettingsMenu;
