// src/pages/Home.jsx
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import Header from "../../components/layout/layoutHome/Header";
import SearchBar from "../../components/layout/layoutHome/SearchBar";
import Footer from "../../components/layout/layoutHome/Footer";
import { useTranslation } from "react-i18next";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllProperties } from "../../services/property.service";

//
// COMPONENT: PropertyCard 
//
function PropertyCard({ item }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card
      onClick={() => navigate(`/property/${item.id}`)}
      sx={{
        width: 280,
        borderRadius: 4,
        bgcolor: "#fff",
        cursor: "pointer",
        flexShrink: 0,
        transition: "0.25s",
        "&:hover": { transform: "scale(1.03)" },
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
      }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          height: 220,
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          mx: 1,
          mt: 1,
        }}
      >
        <CardMedia
          component="img"
          image={item.image}
          alt={item.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Badge */}
        {item.badge && (
          <Chip
            label={t("propertyCard.featured")}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "#fff",
              fontWeight: 700,
              opacity: 0.9,
            }}
          />
        )}

        {/* Favorite button */}
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "rgba(255,255,255,0.9)",
          }}
        >
          <FavoriteBorderIcon />
        </IconButton>
      </Box>

      {/* CONTENT */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {item.title}
        </Typography>

        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="primary"
          sx={{ mt: 0.5 }}
        >
          {item.price} VND / {t("property.monthlyRent")}
        </Typography>

        <Typography variant="body2" mt={0.5} color="text.secondary" noWrap>
          {item.address}
        </Typography>
      </CardContent>
    </Card>
  );
}

//
// COMPONENT: Section (Rooms & Stays in ...)
//
function Section({ province, listings = [] }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ mt: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("home.roomsIn")} {province}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("home.fromSystemData")}
        </Typography>
      </Box>

      {/* Horizontal scroll */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(100,100,100,0.3)",
            borderRadius: 3,
          },
        }}
      >
        {(listings || []).map((item) => (
          <PropertyCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  );
}

//
// HOME PAGE
//
export default function Home() {
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getAllProperties();
    const raw = res?.result || [];

    const formatted = raw.map((p) => ({
      id: p.propertyId,
      title: p.title,
      price: Number(p.monthlyRent).toLocaleString(),
      image:
        p.mediaList?.[0]?.url ||
        "https://via.placeholder.com/500x350?text=No+Image",
      address: p.address?.fullAddress || t("home.unknownAddress"),
      province: p.address?.province || t("home.other"),
      badge: p.propertyLabel === "HOT" ? "HOT" : "",
    }));

    const grouped = formatted.reduce((acc, item) => {
      if (!acc[item.province]) acc[item.province] = [];
      acc[item.province].push(item);
      return acc;
    }, {});

    setSections(
      Object.entries(grouped).map(([province, items]) => ({
        province,
        items,
      }))
    );
  };

  return (
    <Box sx={{ bgcolor: "#0b1b2a", minHeight: "100vh" }}>
      <Header />

      {/* HERO */}
      <Box
        sx={{
          pt: 8,
          pb: 10,
          background:
            "radial-gradient(circle at top, #1d4ed8, #0b1b2a 50%, #020617 100%)",
          color: "#fff",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={800} textAlign="center">
            {t("home.findPerfectPlace")}
          </Typography>

          <Typography
            variant="body1"
            textAlign="center"
            sx={{ mt: 1, opacity: 0.9 }}
          >
            {t("home.exploreThousands")}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <SearchBar />
          </Box>
        </Container>
      </Box>

      {/* LISTINGS */}
      <Box sx={{ bgcolor: "#f5f7fa", py: 6 }}>
        <Container maxWidth="lg">
          {sections.map((sec) => (
            <Section
              key={sec.province}
              province={sec.province}
              listings={sec.items}
            />
          ))}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
