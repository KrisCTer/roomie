// src/components/Home/PropertySection.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const PropertySection = ({
  title,
  properties,
  onViewAll,
  onCardClick,
  location, // Add location prop for filtering
}) => {
  const navigate = useNavigate();

  // Handle "View All" click with location filter
  const handleViewAll = () => {
    if (location) {
      // Navigate to search page with location filter
      const params = new URLSearchParams();
      params.set("location", location);
      navigate(`/search?${params.toString()}`);
    } else if (onViewAll) {
      // Use custom handler if provided
      onViewAll();
    } else {
      // Default: navigate to search page without filters
      navigate("/search");
    }
  };

  return (
    <Box sx={{ mb: 8 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "grey.900",
          }}
        >
          {title}
        </Typography>

        {(onViewAll || location) && (
          <Button
            endIcon={<ArrowForward />}
            onClick={handleViewAll}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "primary.main",
              "&:hover": {
                bgcolor: "primary.50",
              },
            }}
          >
            Xem tất cả
          </Button>
        )}
      </Box>

      {/* Property Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={() => onCardClick(property.id)}
          />
        ))}
      </Box>

      {/* Empty State */}
      {properties.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
            Chưa có bất động sản nào
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Hãy quay lại sau để khám phá thêm nhiều lựa chọn!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PropertySection;
