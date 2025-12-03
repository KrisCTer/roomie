// src/components/SearchBar.jsx
import { Box, Button, Divider, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 80, // nằm dưới header, không đè lên
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
        {/* Địa điểm */}
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
            sx={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}
          >
            Địa điểm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Địa điểm bất kỳ
          </Typography>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", md: "block" } }}
        />

        {/* Thời gian */}
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
            sx={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}
          >
            Thời gian
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thời gian bất kỳ
          </Typography>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", md: "block" } }}
        />

        {/* Khách */}
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
            sx={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}
          >
            Khách
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thêm khách
          </Typography>
        </Box>

        {/* Nút search */}
        <Box sx={{ display: "flex", alignItems: "center", pr: { xs: 0, md: 1 } }}>
          <Button
            variant="contained"
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
