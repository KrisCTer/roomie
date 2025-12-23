// src/components/Home/PropertyCard.jsx
import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

const PropertyCard = ({ property, onClick }) => {
  const { image, title, location, price, bedrooms, bathrooms, size, type } =
    property;

  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: "grey.200",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          "& .property-image": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "66.67%", // 3:2 aspect ratio
          overflow: "hidden",
          bgcolor: "grey.100",
        }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={title}
          className="property-image"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Type Badge */}
        {type && (
          <Chip
            label={type}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.4,
            minHeight: "2.8em",
          }}
        >
          {title}
        </Typography>

        {/* Location */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 2,
          }}
        >
          <LocationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {location}
          </Typography>
        </Box>

        {/* Property Details */}
        {(bedrooms || bathrooms || size) && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            {bedrooms && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {bedrooms}
                </Typography>
              </Box>
            )}

            {bathrooms && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BathIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {bathrooms}
                </Typography>
              </Box>
            )}

            {size && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AreaIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {size}m²
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Price */}
        <Box sx={{ mt: "auto" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: "1.125rem",
            }}
          >
            {price}
            <Typography
              component="span"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "text.secondary",
                ml: 0.5,
              }}
            >
              / tháng
            </Typography>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
