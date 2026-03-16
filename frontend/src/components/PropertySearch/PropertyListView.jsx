// src/components/PropertySearch/PropertyListView.jsx
import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import PropertyCard from "../../components/layout/layoutHome/PropertyCard";

const PropertyListView = ({
  properties,
  loading,
  loadingMore,
  hasMore,
  onPropertyHover,
  onPropertyClick,
}) => {
  // Initial loading skeleton
  if (loading) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 3,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <Box key={i} className="animate-pulse">
            <Box
              sx={{
                bgcolor: "grey.200",
                borderRadius: 3,
                paddingTop: "66.67%",
                mb: 2,
              }}
            />
            <Box sx={{ space: 2 }}>
              <Box
                sx={{
                  height: 16,
                  bgcolor: "grey.200",
                  borderRadius: 1,
                  width: "75%",
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  height: 12,
                  bgcolor: "grey.200",
                  borderRadius: 1,
                  width: "50%",
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  height: 16,
                  bgcolor: "grey.200",
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
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "grey.600", mb: 2, fontWeight: 600 }}
        >
          Không tìm thấy bất động sản phù hợp
        </Typography>
        <Typography variant="body2" sx={{ color: "grey.500" }}>
          Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khu vực khác
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Properties Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        {properties.map((property) => {
          // Transform property data
          const transformedProperty = {
            id: property.propertyId,
            title: property.title,
            image:
              property.mediaList?.[0]?.url ||
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            price: `${property.monthlyRent?.toLocaleString("vi-VN")} đ`,
            location: `${property.address?.district || ""}, ${
              property.address?.province || ""
            }`,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            size: property.size,
            type: property.propertyType,
          };

          return (
            <Box
              key={property.propertyId}
              onMouseEnter={() => onPropertyHover?.(property.propertyId)}
              onMouseLeave={() => onPropertyHover?.(null)}
            >
              <PropertyCard
                property={transformedProperty}
                onClick={() => onPropertyClick?.(property.propertyId)}
              />
            </Box>
          );
        })}
      </Box>

      {/* Loading More Indicator */}
      {loadingMore && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 6,
          }}
        >
          <CircularProgress size={40} thickness={4} />
          <Typography
            variant="body2"
            sx={{ color: "grey.600", fontWeight: 600 }}
          >
            Đang tải thêm bất động sản...
          </Typography>
        </Box>
      )}

      {/* End of Results */}
      {!hasMore && !loadingMore && properties.length > 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderTop: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "grey.500", fontWeight: 500 }}
          >
            🎉 Bạn đã xem hết {properties.length} bất động sản
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "grey.400", display: "block", mt: 1 }}
          >
            Hãy thử điều chỉnh bộ lọc để xem thêm kết quả khác
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PropertyListView;
