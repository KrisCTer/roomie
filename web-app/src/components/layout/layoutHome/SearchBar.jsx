// src/components/SearchBar.jsx
import { Box, Button, Divider, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SearchBar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSearch = () => {
    navigate("/property-search");
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 80,
        zIndex: (theme) => theme.zIndex.appBar + 2,
        maxWidth: scrolled ? 720 : 880,
        mx: "auto",
        transition: "all 0.25s ease",
        transform: scrolled ? "scale(0.9)" : "scale(1)",
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 999,
          p: 1.2,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 1, md: 0 },
          boxShadow: scrolled
            ? "0 10px 30px rgba(15,23,42,0.4)"
            : "0 18px 50px rgba(15,23,42,0.6)",
        }}
      >
        {/* LOCATION */}
        <Box
          sx={{
            flex: 1,
            px: 2.5,
            py: 1,
            borderRadius: 999,
            "&:hover": { bgcolor: "rgba(15,23,42,0.05)" },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              textTransform: "uppercase",
            }}
          >
            {t("searchBar.locationLabel")}
          </Typography>
          
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", md: "block" } }}
        />

        {/* PRICE */}
        <Box
          sx={{
            flex: 1,
            px: 2.5,
            py: 1,
            borderRadius: 999,
            "&:hover": { bgcolor: "rgba(15,23,42,0.05)" },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              textTransform: "uppercase",
            }}
          >
            {t("searchBar.priceLabel")}
          </Typography>
          
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", md: "block" } }}
        />

        {/* ACREAGE */}
        <Box
          sx={{
            flex: 1,
            px: 2.5,
            py: 1,
            borderRadius: 999,
            "&:hover": { bgcolor: "rgba(15,23,42,0.05)" },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              textTransform: "uppercase",
            }}
          >
            {t("searchBar.acreageLabel")}
          </Typography>
          
        </Box>

        {/* SEARCH BUTTON */}
        <Box
          sx={{ display: "flex", alignItems: "center", pr: { xs: 0, md: 1 } }}
        >
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              minWidth: 48,
              height: 48,
              borderRadius: 999,
              bgcolor: "#ff385c",
              "&:hover": { bgcolor: "#e11d48" },
              boxShadow: "0 12px 30px rgba(248,113,113,0.8)",
            }}
          >
            <SearchIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
