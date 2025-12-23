// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

// Components
import StickyHeader from "../../components/layout/layoutHome/StickyHeader";
import HeroSection from "../../components/layout/layoutHome/HeroSection";
import PropertySection from "../../components/layout/layoutHome/PropertySection";
import Footer from "../../components/layout/layoutHome/Footer";

// Services
import { getAllProperties } from "../../services/property.service";

// Utils
const filterApproved = (items) => {
  return items.filter((p) => {
    const status = (p.status || p.propertyStatus || "").toUpperCase();
    return !["PENDING", "DRAFT", "REJECT", "REJECTED"].includes(status);
  });
};

const groupByProvince = (items) => {
  const map = new Map();
  items.forEach((p) => {
    const province =
      p.province || p.provinceName || p.address?.province || "Khác";
    if (!map.has(province)) map.set(province, []);
    map.get(province).push(p);
  });

  return Array.from(map.entries()).map(([province, list]) => ({
    province,
    items: list,
  }));
};

const transformToCardData = (property) => {
  const price =
    property.monthlyRent ?? property.price ?? property.pricePerMonth ?? 0;
  const image =
    property.mediaList?.[0]?.url ||
    property.thumbnail ||
    property.image ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";

  const province =
    property.province ||
    property.provinceName ||
    property.address?.province ||
    "";
  const district = property.district || property.address?.district || "";

  // Property type mapping
  const typeMap = {
    APARTMENT: "Căn hộ",
    HOUSE: "Nhà nguyên căn",
    ROOM: "Phòng trọ",
    STUDIO: "Studio",
    VILLA: "Biệt thự",
    DORMITORY: "Ký túc xá",
    OFFICETEL: "Officetel",
  };

  return {
    id: property.propertyId || property.id,
    title: property.title || "Chưa có tiêu đề",
    image,
    price: `${price.toLocaleString("vi-VN")} đ`,
    location:
      [district, province].filter(Boolean).join(", ") || "Chưa cập nhật",
    bedrooms: property.bedrooms || property.rooms,
    bathrooms: property.bathrooms,
    size: property.size,
    type: typeMap[property.propertyType] || null,
  };
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);

      const res = await getAllProperties();
      console.log("Home getAllProperties response:", res);

      let list = [];
      if (res && res.success && Array.isArray(res.result)) {
        list = res.result;
      } else if (res && res.data && Array.isArray(res.data.result)) {
        list = res.data.result;
      } else if (Array.isArray(res)) {
        list = res;
      }

      const visible = filterApproved(list);
      const grouped = groupByProvince(visible);

      setSections(grouped);
    } catch (error) {
      console.error("Error loading properties:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (id) => {
    if (!id) return;
    navigate(`/property/${id}`);
  };

  const handleViewAll = (province) => {
    // Navigate to PropertySearch with province filter
    const params = new URLSearchParams();
    params.set("location", province);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      {/* Sticky Header */}
      <StickyHeader />

      {/* Hero Section with Search */}
      <HeroSection />

      {/* Property Listings */}
      <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CircularProgress size={48} />
            </Box>
          ) : sections.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">
                {t("home.noProperties") || "Chưa có bất động sản nào"}
              </Typography>
            </Box>
          ) : (
            sections.map((section) => (
              <PropertySection
                key={section.province}
                title={`${
                  t("home.propertiesIn") || "Phòng & Nơi lưu trú tại"
                } ${section.province}`}
                properties={section.items.map(transformToCardData)}
                onViewAll={() => handleViewAll(section.province)}
                onCardClick={handlePropertyClick}
              />
            ))
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
