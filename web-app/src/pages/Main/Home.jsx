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

import { useEffect, useState } from "react";
import { getAllProperties } from "../../services/property.service";

//
// COMPONENT: ListingRow
//
function ListingRow({ title, subtitle, listings = [] }) {
  const safeListings = Array.isArray(listings) ? listings : [];

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
            sx={{
              width: 260,
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "white",
              flexShrink: 0,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                height="180"
                image={item.thumbnail || item.imageUrl || item.images?.[0]}
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
                {item.address?.district || item.city || "Không rõ khu vực"}
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.price?.toLocaleString()} đ / đêm ·{" "}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  ★ {item.rating || 4.8}
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

//
// HOME PAGE
//
export default function Home() {
  const [hcmListings, setHcmListings] = useState([]);
  const [hnListings, setHnListings] = useState([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await getAllProperties();

      // ⭐ MAP DATA từ API → format UI cần
      const formatted = res.map((p) => ({
        id: p._id,
        title: p.title,
        price: Number(p.monthlyRent).toLocaleString(),
        city: p.address?.district || p.address?.province || "Không rõ",
        rating: 4.9, // backend chưa có thì cho mặc định
        badge: p.propertyLabel === "HOT" ? "Được khách yêu thích" : "",
        image:
          p.mediaList?.[0]?.url ||
          "https://via.placeholder.com/400x300?text=No+Image",
        nights: 1, // tạm vì UI đang dùng
      }));

      // Tách theo khu vực như bạn đang làm
      const hcm = formatted.filter(
        (p) =>
          p.city.toLowerCase().includes("hồ chí minh") ||
          p.city.toLowerCase().includes("quận")
      );

      const hanoi = formatted.filter((p) =>
        p.city.toLowerCase().includes("hà nội")
      );

      setHcmListings(hcm);
      setHnListings(hanoi);
    } catch (err) {
      console.error("LOAD PROPERTY ERROR", err);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b1b2a" }}>
      <Header />

      {/* HERO */}
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
              Tìm nơi ở phù hợp cho chuyến đi của bạn
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 540,
                mx: "auto",
                color: "rgba(241,245,249,0.85)",
              }}
            >
              Khám phá hàng ngàn căn hộ, nhà ở, homestay với giá minh bạch và
              đặt phòng nhanh chóng, an toàn.
            </Typography>
          </Box>

          <SearchBar />
        </Container>
      </Box>

      {/* LISTINGS */}
      <Box sx={{ bgcolor: "#f9fafb", pb: 8 }}>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <ListingRow
            title="Nơi lưu trú được ưa chuộng tại Hồ Chí Minh"
            subtitle="Dữ liệu từ hệ thống"
            listings={hcmListings}
          />

          <ListingRow
            title="Căn phòng tại Hà Nội"
            subtitle="Dữ liệu từ hệ thống"
            listings={hnListings}
          />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
