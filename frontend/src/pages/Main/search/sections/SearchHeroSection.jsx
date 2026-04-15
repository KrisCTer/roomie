import React from "react";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { Grid2X2, Map as MapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const SearchHeroSection = ({
  isDesktop,
  mobileView,
  setMobileView,
  baseCount,
  visibleCount,
  mapBounds,
  filterCount,
  onOpenFilters,
}) => {
  const { t } = useTranslation();

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
            <Typography className="search-kicker">{t("search.kicker")}</Typography>
            <Typography className="search-headline" component="h1">
              {t("search.headline1")}
              <span>{t("search.headline2")}</span>
            </Typography>
            <Typography
              sx={{ mt: 1.2, color: "var(--home-muted)", maxWidth: 760 }}
            >
              {t("search.subtitle")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              onClick={onOpenFilters}
              variant="outlined"
              sx={{
                borderRadius: 999,
                minHeight: 36,
                textTransform: "none",
                borderColor: "#DCC8B1",
                color: "#1F2937",
                fontWeight: 700,
                bgcolor: "#FFF",
                px: 1.8,
              }}
            >
              {filterCount > 0
                ? t("search.filterBtnCount", { count: filterCount })
                : t("search.filterBtn")}
            </Button>
            <Chip label={t("search.candidates", { count: baseCount })} className="search-chip" />
            <Chip label={t("search.displayed", { count: visibleCount })} className="search-chip" />
            <Chip
              label={mapBounds ? t("search.filteringByMap") : t("search.fullSearch")}
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
              {t("search.list")}
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
              {t("search.map")}
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default SearchHeroSection;
