// src/components/Home/HeroSection.jsx
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchBar from "../../layout/layoutHome/SearchBar";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 10 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Title */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "white",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {t("home.findYourPerfectPlace") || "Tìm nơi ở lý tưởng"}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 400,
              fontSize: { xs: "1rem", md: "1.25rem" },
              maxWidth: 600,
              mx: "auto",
            }}
          >
            {t("home.subtitle") ||
              "Khám phá hàng ngàn căn hộ, phòng trọ, nhà nguyên căn cho thuê dài hạn"}
          </Typography>
        </Box>

        {/* Search Bar */}
        <SearchBar />
      </Container>
    </Box>
  );
};

export default HeroSection;
