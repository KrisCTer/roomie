// web-app/src/components/common/ThemeToggle.jsx
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as SystemIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const ThemeToggle = ({ size = "medium" }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <LightModeIcon />;
      case "dark":
        return <DarkModeIcon />;
      default:
        return <SystemIcon />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return t("common.light");
      case "dark":
        return t("common.dark");
      default:
        return t("common.system");
    }
  };

  return (
    <Tooltip title={getTooltip()}>
      <IconButton onClick={toggleTheme} size={size} color="inherit">
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
