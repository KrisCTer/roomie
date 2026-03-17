import React from "react";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { Grid2X2, Map as MapIcon } from "lucide-react";

const SearchHeroSection = ({
  isDesktop,
  mobileView,
  setMobileView,
  baseCount,
  visibleCount,
  mapBounds,
}) => {
  return (
    <Box
      className="search-hero-shell"
      sx={{ borderBottom: "1px solid", borderColor: "#EADCCB" }}
    >
      <Container
        maxWidth="xl"
        sx={{ pt: { xs: 2.5, md: 3 }, pb: { xs: 2.5, md: 3.5 } }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={2.2}
        >
          <Box>
            <Typography className="search-kicker">SEARCH EXPLORER</Typography>
            <Typography className="search-headline" component="h1">
              Bản đồ khu ở.
              <span>Danh sách theo gu.</span>
            </Typography>
            <Typography
              sx={{ mt: 1.2, color: "var(--home-muted)", maxWidth: 760 }}
            >
              Lọc theo khu vực, loại hình và ngân sách, sau đó so sánh trực quan
              giữa bản đồ và danh sách.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${baseCount} ứng viên`} className="search-chip" />
            <Chip label={`${visibleCount} hiển thị`} className="search-chip" />
            <Chip
              label={
                mapBounds ? "Đang lọc theo vùng map" : "Toàn vùng tìm kiếm"
              }
              className="search-chip"
            />
          </Stack>
        </Stack>

        {!isDesktop && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              onClick={() => setMobileView("list")}
              variant={mobileView === "list" ? "contained" : "outlined"}
              startIcon={<Grid2X2 size={16} />}
              sx={{
                flex: 1,
                borderRadius: 999,
                minHeight: 44,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: mobileView === "list" ? "#1F2937" : "transparent",
                color: mobileView === "list" ? "white" : "#1F2937",
                borderColor: "#DCC8B1",
                boxShadow: "none",
              }}
            >
              Danh sách
            </Button>
            <Button
              onClick={() => setMobileView("map")}
              variant={mobileView === "map" ? "contained" : "outlined"}
              startIcon={<MapIcon size={16} />}
              sx={{
                flex: 1,
                borderRadius: 999,
                minHeight: 44,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: mobileView === "map" ? "#1F2937" : "transparent",
                color: mobileView === "map" ? "white" : "#1F2937",
                borderColor: "#DCC8B1",
                boxShadow: "none",
              }}
            >
              Bản đồ
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default SearchHeroSection;
