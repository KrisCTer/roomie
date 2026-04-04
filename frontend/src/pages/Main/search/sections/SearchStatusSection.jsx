import React from "react";
import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import { MapPin } from "lucide-react";

const SearchStatusSection = ({
  loading,
  waitingForMapSync,
  visibleCount,
  mapBounds,
  effectiveTotalPages,
  currentPage,
  searchCriteria,
  t,
}) => {
  return (
    <Box
      sx={{
        bgcolor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "#EFE7DC",
        py: 2.25,
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.25}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "grey.700", fontWeight: 500 }}
            >
              {loading
                ? t("propertySearch.loading")
                : waitingForMapSync
                  ? "Đang đồng bộ danh sách với bản đồ..."
                  : `${visibleCount} ${t("propertySearch.places")}${
                      mapBounds ? ` ${t("propertySearch.inArea")}` : ""
                    }${
                      effectiveTotalPages > 1
                        ? ` · ${t("propertySearch.page")} ${currentPage}/${effectiveTotalPages}`
                        : ""
                    }`}
            </Typography>
            {searchCriteria.location && (
              <Typography
                variant="body2"
                sx={{ color: "#DD6B20", fontWeight: 600, mt: 0.5 }}
              >
                <MapPin
                  size={14}
                  style={{ display: "inline-block", marginRight: 4 }}
                />
                {t("propertySearch.searchResultAt")}: {searchCriteria.location}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {waitingForMapSync && (
              <Chip
                size="small"
                label="Đang khớp với vùng bản đồ"
                sx={{
                  bgcolor: "#FFF4E8",
                  color: "#B45309",
                  fontWeight: 600,
                  border: "1px solid #FED7AA",
                }}
              />
            )}
            {!loading && !waitingForMapSync && (
              <Chip
                size="small"
                label={`${visibleCount} kết quả`}
                sx={{
                  bgcolor: "#F6F6F6",
                  color: "#374151",
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default SearchStatusSection;
