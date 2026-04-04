import React from "react";
import { Box, Button, Chip, Container, Stack } from "@mui/material";
import { Grid2X2, Map as MapIcon } from "lucide-react";

const SearchFilterBarSection = ({
  isDesktop,
  filterCount,
  mapBounds,
  mobileView,
  setMobileView,
  onOpenFilters,
}) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 64,
        zIndex: 45,
        bgcolor: "rgba(255,250,245,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #EADCCB",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 1.2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1.5}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              onClick={onOpenFilters}
              variant="outlined"
              sx={{
                borderRadius: 999,
                minHeight: 40,
                textTransform: "none",
                borderColor: "#DCC8B1",
                color: "#1F2937",
                fontWeight: 700,
                bgcolor: "#FFF",
              }}
            >
              {`Bộ lọc${filterCount > 0 ? ` (${filterCount})` : ""}`}
            </Button>
            <Chip
              label={mapBounds ? "Đang theo vùng map" : "Toàn vùng map"}
              className="search-chip"
            />
          </Stack>

          {!isDesktop && (
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => setMobileView("list")}
                variant={mobileView === "list" ? "contained" : "outlined"}
                startIcon={<Grid2X2 size={16} />}
                sx={{
                  borderRadius: 999,
                  minHeight: 40,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: mobileView === "list" ? "#1F2937" : "transparent",
                  color: mobileView === "list" ? "white" : "#1F2937",
                  borderColor: "#DCC8B1",
                  boxShadow: "none",
                  px: 2,
                }}
              >
                List
              </Button>
              <Button
                onClick={() => setMobileView("map")}
                variant={mobileView === "map" ? "contained" : "outlined"}
                startIcon={<MapIcon size={16} />}
                sx={{
                  borderRadius: 999,
                  minHeight: 40,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: mobileView === "map" ? "#1F2937" : "transparent",
                  color: mobileView === "map" ? "white" : "#1F2937",
                  borderColor: "#DCC8B1",
                  boxShadow: "none",
                  px: 2,
                }}
              >
                Map
              </Button>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default SearchFilterBarSection;
