import { Menu, X, Plus } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Right side */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton color="inherit">
            <LanguageIcon />
          </IconButton>
          <Button
            color="inherit"
            sx={{ textTransform: "none" }}
            onClick={() => navigate("/")}
          >
            Trở thành người thuê
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/add-property")}
            sx={{
              borderRadius: 999,
              px: 2.5,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563eb",
            }}
          >
            Submit Property
          </Button>
          <IconButton
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: 1 }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </div>
    </header>
  );
};

export default Header;
