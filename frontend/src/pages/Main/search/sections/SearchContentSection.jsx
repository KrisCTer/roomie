import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Compass, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import PropertyListView from "../../../../components/PropertySearch/PropertyListView";
import PropertyMapView from "../../../../components/PropertySearch/PropertyMapView";

const SearchContentSection = ({
  showListPanel,
  showMapPanel,
  error,
  effectiveDisplayedProperties,
  indexOfFirstItem,
  indexOfLastItem,
  loading,
  waitingForMapSync,
  currentPage,
  effectiveTotalPages,
  onPageChange,
  onPropertyHover,
  onPropertyClick,
  mapBounds,
  mapProperties,
  hoveredPropertyId,
  onBoundsChange,
  onInitialBoundsReady,
  initialCenter,
  initialZoom,
  nearbyEnabled,
  nearbyLat,
  nearbyLng,
  nearbyRadiusKm,
  distanceMap,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.06fr 0.94fr" },
        gap: { lg: 2 },
        px: { lg: 2 },
        py: { lg: 2 },
        minHeight: "calc(100vh - 240px)",
      }}
    >
      {showListPanel && (
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: { lg: 4 },
            boxShadow: { lg: "0 14px 36px rgba(17,24,39,0.06)" },
            borderRight: { xs: "none", lg: "1px solid" },
            borderColor: "grey.200",
            overflowY: "auto",
            maxHeight: { lg: "calc(100vh - 240px)" },
          }}
        >
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2.2 }}
            >
              <Compass size={17} color="#B45309" />
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#7A6D61",
                }}
              >
                {nearbyEnabled ? "NEARBY RESULTS" : "DISCOVERY LIST"}
              </Typography>
            </Stack>

            {error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: "error.50",
                  border: "1px solid",
                  borderColor: "error.200",
                  borderRadius: 2,
                  color: "error.700",
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}

            <PropertyListView
              properties={effectiveDisplayedProperties.slice(
                indexOfFirstItem,
                indexOfLastItem,
              )}
              loading={loading || waitingForMapSync}
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              onPageChange={onPageChange}
              onPropertyHover={onPropertyHover}
              onPropertyClick={onPropertyClick}
              distanceMap={distanceMap}
              nearbyEnabled={nearbyEnabled}
            />
          </Container>
        </Box>
      )}

      {showMapPanel && (
        <Box
          sx={{
            display: "block",
            position: { xs: "relative", lg: "sticky" },
            top: { lg: 153 },
            height: { xs: "66vh", lg: "calc(100vh - 240px)" },
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 14px 36px rgba(17,24,39,0.08)",
          }}
        >
          <Box className="search-map-badge">
            <MapIcon size={14} />
            <span>{nearbyEnabled ? `Quanh day ${nearbyRadiusKm}km` : mapBounds ? "Đang theo vùng bản đồ" : "Toàn vùng"}</span>
            <SlidersHorizontal size={14} />
          </Box>

          <PropertyMapView
            properties={mapProperties}
            hoveredPropertyId={hoveredPropertyId}
            onPropertyClick={onPropertyClick}
            onBoundsChange={onBoundsChange}
            onInitialBoundsReady={onInitialBoundsReady}
            initialCenter={initialCenter}
            initialZoom={initialZoom}
            nearbyEnabled={nearbyEnabled}
            nearbyLat={nearbyLat}
            nearbyLng={nearbyLng}
            nearbyRadiusKm={nearbyRadiusKm}
          />
        </Box>
      )}
    </Box>
  );
};

export default SearchContentSection;
