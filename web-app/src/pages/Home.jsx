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

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer"; // nếu bạn đã tạo Footer như trước
import FloatingSearchButton from "../components/FloatingSearchButton";


// ─── Demo data ──────────────────────────────────────────────
const hcmListings = [
  {
    id: 1,
    title: "Căn hộ tại Thành phố Hồ Chí Minh",
    city: "Thành phố Hồ Chí Minh",
    price: "760.000",
    nights: 2,
    rating: 5.0,
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    badge: "Được khách yêu thích",
  },
  {
    id: 2,
    title: "Căn hộ studio hiện đại",
    city: "Quận 1",
    price: "1.437.000",
    nights: 2,
    rating: 4.87,
    image: "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
    badge: "Được khách yêu thích",
  },
  {
    id: 3,
    title: "Căn hộ cao cấp Thủ Đức",
    city: "Thủ Đức",
    price: "922.000",
    nights: 2,
    rating: 4.91,
    image: "https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg",
    badge: "Được khách yêu thích",
  },
  {
    id: 4,
    title: "Nhà nguyên căn 3 phòng ngủ",
    city: "Gò Vấp",
    price: "1.584.000",
    nights: 2,
    rating: 4.86,
    image: "https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg",
    badge: "Được khách yêu thích",
  },
];

const hnListings = [
  {
    id: 5,
    title: "Căn hộ tại Quận Tây Hồ",
    city: "Hà Nội",
    price: "899.000",
    nights: 2,
    rating: 4.95,
    image: "https://images.pexels.com/photos/3754591/pexels-photo-3754591.jpeg",
    badge: "Được khách yêu thích",
  },
  {
    id: 6,
    title: "Nơi ở tại Quận Đống Đa",
    city: "Hà Nội",
    price: "743.000",
    nights: 2,
    rating: 4.88,
    image: "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
    badge: "Được khách yêu thích",
  },
  {
    id: 7,
    title: "Căn hộ tại Hoàn Kiếm",
    city: "Hà Nội",
    price: "1.120.000",
    nights: 2,
    rating: 4.97,
    image: "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg",
    badge: "Được khách yêu thích",
  },
  {
    id: 8,
    title: "Nhà cổ phố cổ",
    city: "Hà Nội",
    price: "1.320.000",
    nights: 2,
    rating: 4.9,
    image: "https://images.pexels.com/photos/4392270/pexels-photo-4392270.jpeg",
    badge: "Được khách yêu thích",
  },
];

// ─── ListingRow ─────────────────────────────────────────────
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
              minWidth: 260,
              borderRadius: 3,
              boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
              overflow: "hidden",
              bgcolor: "white",
              flexShrink: 0,
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                height="180"
                image={item.image}
                sx={{ objectFit: "cover" }}
              />
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
                {item.city}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.price} đ / {item.nights} đêm ·{" "}
                <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                  ★ {item.rating}
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

// ─── Home page ──────────────────────────────────────────────
export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b1b2a" }}>
      {/* Header dùng chung */}
      <Header />

      {/* HERO + SEARCH BAR */}
      <Box
        sx={{
          pt: 6,
          pb: 10,
          background:
            "radial-gradient(circle at top, #1d4ed8 0, #0b1b2a 45%, #020617 100%)",
        }}
      >
        <Container maxWidth="lg">
          {/* Title + subtitle */}
          <Box sx={{ textAlign: "center", color: "white", mb: 4 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
              Tìm nơi ở phù hợp cho chuyến đi của bạn
            </Typography>
            <Typography
              variant="body1"
              sx={{ maxWidth: 540, mx: "auto", color: "rgba(241,245,249,0.85)" }}
            >
              Khám phá hàng ngàn căn hộ, nhà ở, homestay với giá minh bạch
              và đặt phòng nhanh chóng, an toàn.
            </Typography>
          </Box>

          {/* Thanh search sticky + zoom */}
          <SearchBar />
        </Container>
      </Box>

      {/* DANH SÁCH GỢI Ý */}
      <Box sx={{ bgcolor: "#f9fafb", pb: 8 }}>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <ListingRow
            title="Nơi lưu trú được ưa chuộng tại Hồ Chí Minh"
            subtitle="Những lựa chọn phổ biến nhất"
            listings={hcmListings}
          />
          <ListingRow
            title="Căn phòng tại Hà Nội vào tháng tới"
            subtitle="Gợi ý cho chuyến đi tiếp theo"
            listings={hnListings}
          />
        </Container>
      </Box>

      {/* Nút search tròn nổi góc phải */}
      <FloatingSearchButton />

      {/* Footer cuối trang */}
      <Footer />
    </Box>
  );
}