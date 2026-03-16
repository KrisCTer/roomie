// web-app/src/components/common/LanguageSwitcher.jsx
import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ size = "medium" }) => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇬🇧" },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
    handleClose();
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);

  return (
    <>
      <Tooltip title={currentLanguage?.name || "Language"}>
        <IconButton onClick={handleClick} size={size} color="inherit">
          <Box component="span" sx={{ fontSize: "1.2em" }}>
            {currentLanguage?.flag || <LanguageIcon />}
          </Box>
        </IconButton>
      </Tooltip>

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
            minWidth: 180,
            borderRadius: 2,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemIcon>
              {i18n.language === lang.code && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              <Box display="flex" alignItems="center" gap={1}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Box>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
