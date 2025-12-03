// src/components/Header.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

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
        <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
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
            Nơi lưu trú
          </Button>
          <Button color="inherit" sx={{ textTransform: "none" }}>
            Trải nghiệm
          </Button>
          <Button color="inherit" sx={{ textTransform: "none" }}>
            Dịch vụ
          </Button>
        </Box>

        {/* Right side */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton color="inherit">
            <LanguageIcon />
          </IconButton>
          <Button
            color="inherit"
            sx={{ textTransform: "none" }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
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
            Đăng ký
          </Button>
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
