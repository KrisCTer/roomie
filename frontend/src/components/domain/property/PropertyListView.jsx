// src/components/PropertySearch/PropertyListView.jsx
import React from "react";
import { Box, Typography, Pagination, Stack } from "@mui/material";
import { BedDouble, Bath, Ruler, MapPin, ArrowUpRight, Navigation } from "lucide-react";

const PropertyListView = ({
  properties,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onPropertyHover,
  onPropertyClick,
  onDirections,
  onClearDirections,
  directionsTarget,
  distanceMap,
  nearbyEnabled,
}) => {
  // Initial loading skeleton
  if (loading) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2.4,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            className="animate-pulse"
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: "1px solid #F1ECE3",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                bgcolor: "#EEE7DC",
                borderRadius: 3,
                paddingTop: "66.67%",
                mb: 2,
              }}
            />
            <Box sx={{ space: 2 }}>
              <Box
                sx={{
                  height: 16,
                  bgcolor: "#EEE7DC",
                  borderRadius: 1,
                  width: "75%",
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  height: 12,
                  bgcolor: "#EEE7DC",
                  borderRadius: 1,
                  width: "50%",
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  height: 16,
                  bgcolor: "#EEE7DC",
                  borderRadius: 1,
                  width: "40%",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // No results
  if (properties.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 12,
          px: 2,
          borderRadius: 3,
          border: "1px dashed #E5E7EB",
          bgcolor: "#FFFCF8",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#374151", mb: 1.5, fontWeight: 700 }}
        >
          Không tìm thấy bất động sản phù hợp
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khu vực khác
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2.4,
          mb: 3.2,
        }}
      >
        {properties.map((property) => {
          const image =
            property.mediaList?.[0]?.url ||
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1100";
          const location = `${property.address?.district || ""}, ${property.address?.province || ""}`;
          const distance = nearbyEnabled && distanceMap ? distanceMap.get(property.propertyId) : null;

          return (
            <Box
              key={property.propertyId}
              className="search-result-card"
              onMouseEnter={() => onPropertyHover?.(property.propertyId)}
              onMouseLeave={() => onPropertyHover?.(null)}
              onClick={() => onPropertyClick?.(property.propertyId)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onPropertyClick?.(property.propertyId);
                }
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2.5,
                  overflow: "hidden",
                }}
              >
                <img
                  src={image}
                  alt={property.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: 210,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <span className="search-result-type">
                  {property.propertyType || "PROPERTY"}
                </span>
              </Box>

              <Box sx={{ p: 1.8 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Typography
                    sx={{ fontWeight: 700, color: "#1F2937", lineHeight: 1.35 }}
                  >
                    {property.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#1F2937",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {property.monthlyRent?.toLocaleString("vi-VN")} đ
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 0.8,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    fontSize: 13.5,
                    color: "#6B7280",
                  }}
                >
                  <MapPin size={14} />
                  <span className="search-line-clamp-1">{location}</span>
                  {distance != null && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        marginLeft: 6,
                        padding: "2px 8px",
                        borderRadius: 999,
                        backgroundColor: "#ECFDF5",
                        color: "#065F46",
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      <Navigation size={10} />
                      {distance}km
                    </span>
                  )}
                </Typography>

                <Stack direction="row" spacing={0.8} sx={{ mt: 1.2 }}>
                  <span className="search-meta-pill">
                    <BedDouble size={13} /> {property.bedrooms || "-"}
                  </span>
                  <span className="search-meta-pill">
                    <Bath size={13} /> {property.bathrooms || "-"}
                  </span>
                  <span className="search-meta-pill">
                    <Ruler size={13} />{" "}
                    {property.size ? `${property.size}m²` : "-"}
                  </span>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 1.4 }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#8A8177",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                    }}
                  >
                    QUICK PREVIEW
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {property.address?.location && (() => {
                      const [destLat, destLng] = property.address.location
                        .split(",")
                        .map((v) => parseFloat(v.trim()));
                      const isActive = directionsTarget
                        && Math.abs(directionsTarget.lat - destLat) < 0.0001
                        && Math.abs(directionsTarget.lng - destLng) < 0.0001;

                      return (
                        <Typography
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isActive) {
                              onClearDirections?.();
                            } else if (!isNaN(destLat) && !isNaN(destLng)) {
                              onDirections?.({ lat: destLat, lng: destLng });
                            }
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: 13,
                            fontWeight: 700,
                            color: isActive ? "#DC2626" : "#059669",
                            cursor: "pointer",
                            transition: "color 0.2s",
                            "&:hover": { color: isActive ? "#B91C1C" : "#047857" },
                          }}
                        >
                          <Navigation size={13} />
                          {isActive ? "Hủy chỉ đường" : "Chỉ đường"}
                        </Typography>
                      );
                    })()}
                    <Typography
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.7,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#B45309",
                      }}
                    >
                      Xem chi tiết <ArrowUpRight size={14} />
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          );
        })}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
          <Pagination
            page={currentPage}
            count={totalPages}
            onChange={(_, page) => onPageChange?.(page)}
            shape="rounded"
            siblingCount={0}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 999,
                minWidth: 36,
                height: 36,
                border: "1px solid #E5D5C1",
                color: "#4B5563",
              },
              "& .Mui-selected": {
                bgcolor: "#1F2937 !important",
                color: "#fff",
                borderColor: "#1F2937",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PropertyListView;
