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

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllProperties } from "../../services/property.service";

//
// COMPONENT: ListingRow
//
function ListingRow({ title, subtitle, listings = [] }) {
  const safeListings = Array.isArray(listings) ? listings : [];
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 3,
          pb: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(148,163,184,0.9)",
            borderRadius: 999,
          },
        }}
      >
        {safeListings.map((item) => (
          <Card
            key={item.id}
            onClick={() => navigate(`/property/${item.id}`)}
            sx={{
              width: 260,
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "white",
              flexShrink: 0,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              "&:hover": { transform: "scale(1.02)", transition: "0.2s" },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                height="180"
                image={
                  item.image ||
                  item.thumbnail ||
                  item.imageUrl ||
                  item.images?.[0] ||
                  "https://via.placeholder.com/400x300"
                }
                sx={{ objectFit: "cover" }}
              />

              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    bgcolor: "rgba(255,255,255,0.9)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}

              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  bgcolor: "rgba(255,255,255,0.9)",
                }}
              >
                <FavoriteBorderIcon fontSize="small" />
              </IconButton>
            </Box>

            <CardContent sx={{ p: 2 }}>
              <Typography noWrap variant="subtitle2" fontWeight={600}>
                {item.title}
              </Typography>

              <Typography noWrap variant="body2" color="text.secondary">
                {item.district ||
                  item.cityLabel ||
                  item.address?.district ||
                  item.city ||
                  "Unknown area"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

//
// HOME PAGE (ENGLISH VERSION)
//
export default function Home() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadListings();
  }, []);

  const extractListFromResponse = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.result)) return res.result;
    if (Array.isArray(res?.content)) return res.content;
    if (Array.isArray(res?.result?.content)) return res.result.content;
    return [];
  };

  const loadListings = async () => {
    try {
      const res = await getAllProperties();
      const list = extractListFromResponse(res);

      const formatted = list.map((p) => {
        const province = p.address?.province || "Khác";
        const district = p.address?.district || "";
        return {
          id: p.propertyId || p._id,
          title: p.title,
          price: Number(p.monthlyRent || 0).toLocaleString(),
          province,
          district,
          cityLabel: district || province,
          rating: 4.9,
          badge: p.propertyLabel === "HOT" ? "Guest Favorite" : "",
          image:
            p.mediaList?.[0]?.url || "https://via.placeholder.com/400x300",
          nights: 1,
        };
      });

      const grouped = formatted.reduce((acc, item) => {
        const key = item.province || "Khác";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      const sectionsData = Object.entries(grouped).map(
        ([provinceName, listings]) => ({
          provinceName,
          listings,
        })
      );

      setSections(sectionsData);
    } catch (err) {
      console.error("LOAD PROPERTY ERROR", err);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b1b2a" }}>
      <Header />

      {/* HERO SECTION */}
      <Box
        sx={{
          pt: 6,
          pb: 10,
          background:
            "radial-gradient(circle at top, #1d4ed8 0, #0b1b2a 45%, #020617 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", color: "white", mb: 4 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
              Find the perfect place for your stay
            </Typography>

            <Typography
              variant="body1"
              sx={{
                maxWidth: 540,
                mx: "auto",
                color: "rgba(241,245,249,0.85)",
              }}
            >
              Explore thousands of apartments, houses, and homestays with
              transparent pricing and fast, secure booking.
            </Typography>
          </Box>

          <SearchBar />
        </Container>
      </Box>

      {/* LISTINGS */}
      <Box sx={{ bgcolor: "#f9fafb", pb: 8 }}>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          {sections.map((section) => (
            <ListingRow
              key={section.provinceName}
              title={`Rooms & Stays in ${section.provinceName}`}
              subtitle="From system data"
              listings={section.listings}
            />
          ))}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
