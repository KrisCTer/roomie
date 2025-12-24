// src/components/layout/layoutHome/HeroSection.jsx
import React from "react";
import { Box, Container, Typography, Chip, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Home as HomeIcon,
  Apartment,
  Villa,
  Business,
  TrendingUp,
  Verified,
} from "@mui/icons-material";
import SearchBar from "./SearchBar";

const HeroSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: <Verified sx={{ fontSize: 16 }} />, label: "Verified Properties" },
    { icon: <TrendingUp sx={{ fontSize: 16 }} />, label: "Best Prices" },
    { icon: <HomeIcon sx={{ fontSize: 16 }} />, label: "10K+ Listings" },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 10, md: 14 },
        pb: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

        // Animated background patterns
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%), " +
            "radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
          animation: "float 20s ease-in-out infinite",
        },

        // Floating circles decoration
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          filter: "blur(60px)",
          animation: "pulse 8s ease-in-out infinite",
        },

        "@keyframes float": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            transform: "translateY(-20px) scale(1.05)",
          },
        },

        "@keyframes pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: 0.5,
          },
          "50%": {
            transform: "scale(1.1)",
            opacity: 0.3,
          },
        },

        "@keyframes slideUp": {
          from: {
            opacity: 0,
            transform: "translateY(30px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        "@keyframes fadeIn": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Feature Chips */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{
            mb: 4,
            animation: "fadeIn 1s ease-out 0.2s both",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {features.map((feature, index) => (
            <Chip
              key={index}
              icon={feature.icon}
              label={feature.label}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", md: "0.875rem" },
                px: { xs: 0.5, md: 1 },
                "& .MuiChip-icon": {
                  color: "white",
                },
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            />
          ))}
        </Stack>

        {/* Main Content */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          {/* Main Title */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: "white",
              mb: 3,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              animation: "slideUp 0.8s ease-out",
              background: "linear-gradient(to right, #ffffff, #f0f0f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("home.findPerfectPlace") || "Tìm nơi ở lý tưởng"}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255,255,255,0.95)",
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              maxWidth: 700,
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
              textShadow: "0 2px 8px rgba(0,0,0,0.15)",
              animation: "slideUp 0.8s ease-out 0.2s both",
            }}
          >
            {t("home.exploreThousands") ||
              "Khám phá hàng ngàn căn hộ, phòng trọ, nhà nguyên căn cho thuê dài hạn"}
          </Typography>

          {/* Property Type Icons */}
          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            sx={{
              mb: 5,
              animation: "fadeIn 1s ease-out 0.4s both",
              flexWrap: "wrap",
              gap: 2,
            }}
          ></Stack>
        </Box>

        {/* Search Bar with enhanced styling */}
        <Box
          sx={{
            animation: "slideUp 0.8s ease-out 0.4s both",
            "& > *": {
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
                transform: "translateY(-2px)",
              },
            },
          }}
        >
          <SearchBar />
        </Box>

        {/* Stats Row */}
        <Stack
          direction="row"
          divider={
            <Box
              sx={{
                width: 1,
                height: 40,
                bgcolor: "rgba(255,255,255,0.2)",
                display: { xs: "none", md: "block" },
              }}
            />
          }
          spacing={{ xs: 2, md: 4 }}
          justifyContent="center"
          sx={{
            mt: 6,
            animation: "fadeIn 1s ease-out 0.6s both",
            flexWrap: "wrap",
          }}
        ></Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
