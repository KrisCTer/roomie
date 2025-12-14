// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
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

import { getAllProperties } from "../../services/property.service";

// Nhóm theo tỉnh/thành (nếu không có thì gom vào "Từ dữ liệu hệ thống")
const groupByProvince = (items) => {
  const map = new Map();
  items.forEach((p) => {
    const province =
      p.province ||
      p.provinceName ||
      p.address?.province ||
      "Từ dữ liệu hệ thống";
    if (!map.has(province)) map.set(province, []);
    map.get(province).push(p);
  });

  return Array.from(map.entries()).map(([province, list]) => ({
    province,
    items: list,
  }));
};

// Lọc chỉ lấy property đã duyệt
const filterApproved = (items) => {
  return items.filter((p) => {
    const status = (p.status || p.propertyStatus || "").toUpperCase();
    // Ẩn: PENDING / DRAFT / REJECT / REJECTED
    if (
      ["PENDING", "DRAFT", "REJECT", "REJECTED"].includes(status)
    ) {
      return false;
    }
    // Giữ lại APPROVED, AVAILABLE, SOLD, RENTED...
    return true;
  });
};

const transformToCardData = (property) => {
  const price =
    property.monthlyRent ??
    property.price ??
    property.pricePerMonth ??
    0;

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

  const district =
    property.district ||
    property.address?.district ||
    "";

  return {
    id: property.propertyId || property.id,
    title: property.title || "No title",
    image,
    price: `${price.toLocaleString()} VND / Giá thuê tháng`,
    location: [district, province].filter(Boolean).join(", "),
  };
};

const ListingCard = ({ item }) => (
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: "0 18px 45px rgba(15,23,42,0.15)",
      overflow: "hidden",
      cursor: "pointer",
      position: "relative",
    }}
  >
    {/* Ảnh */}
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
      <CardMedia component="img" image={item.image} sx={{ height: "100%" }} />

      <IconButton
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          bgcolor: "rgba(15,23,42,0.6)",
          "&:hover": { bgcolor: "rgba(15,23,42,0.8)" },
        }}
      >
        <FavoriteBorderIcon sx={{ color: "white" }} />
      </IconButton>
    </Box>

    {/* Nội dung */}
    <CardContent sx={{ px: 3, pt: 2, pb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, mb: 0.5 }}
        noWrap
      >
        {item.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 1 }}
        noWrap
      >
        {item.location}
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: "#2563eb", mb: 1 }}
      >
        {item.price}
      </Typography>

      <Chip
        label="Từ dữ liệu hệ thống"
        size="small"
        sx={{
          bgcolor: "rgba(37,99,235,0.08)",
          color: "#2563eb",
          fontWeight: 600,
        }}
      />
    </CardContent>
  </Card>
);

const Section = ({ province, listings }) => (
  <Box sx={{ mb: 6 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 3,
        alignItems: "center",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Phòng & Nơi lưu trú tại {province}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Từ dữ liệu hệ thống
      </Typography>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 3,
      }}
    >
      {listings.map((p) => {
        const card = transformToCardData(p);
        return <ListingCard key={card.id} item={card} />;
      })}
    </Box>
  </Box>
);

export default function Home() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllProperties();
        console.log("Home getAllProperties response:", res);

        // Chuẩn: { code, success, message, result: [...] }
        let list = [];
        if (res && res.success && Array.isArray(res.result)) {
          list = res.result;
        } else if (res && res.data && Array.isArray(res.data.result)) {
          list = res.data.result;
        } else if (Array.isArray(res)) {
          list = res;
        }

        const visible = filterApproved(list);
        setSections(groupByProvince(visible));
      } catch (error) {
        console.error("Error loading properties for home:", error);
        setSections([]);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ bgcolor: "#020617", minHeight: "100vh" }}>
      <Header />

      {/* Hero + Search */}
      <Box
        sx={{
          background:
            "radial-gradient(circle at top, #1d4ed8 0, #020617 55%, #020617 100%)",
          pt: 10,
          pb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: "white",
              textAlign: "center",
            }}
          >
            Tìm nơi ở hoàn hảo cho bạn
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(226,232,240,0.8)",
              textAlign: "center",
              mb: 6,
            }}
          >
            Khám phá hàng ngàn căn hộ, nhà và homestay trên toàn thế giới.
          </Typography>

          <SearchBar />
        </Container>
      </Box>

      {/* Danh sách */}
      <Box sx={{ bgcolor: "#f1f5f9", py: 6 }}>
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
