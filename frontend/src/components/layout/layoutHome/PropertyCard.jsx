/* aria-label */
// src/components/Home/PropertyCard.jsx
import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Bed,
  Bath,
  Maximize,
  Home,
  MapPin,
  Heart,
  Share2,
  ArrowRight,
} from "lucide-react";
import { useFavorite } from "../../../hooks/common/useFavorite";
import { useDialog } from "../../../contexts/DialogContext";

const PropertyCard = ({ property, onClick }) => {
  const { id, image, title, location, price, bedrooms, bathrooms, size, type } =
    property;

  // Favorite hook
  const {
    isFavorited,
    favoriteCount,
    isLoading: favoriteLoading,
    handleToggleFavorite,
  } = useFavorite(id);
  const { showToast } = useDialog();

  // Share handler
  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent card click

    try {
      const url = `${window.location.origin}/property/${id}`;

      if (navigator.share) {
        await navigator.share({
          title: title,
          text: "Xem phòng trọ này trên Roomie!",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Đã sao chép liên kết!", "success");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Favorite handler
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card click
    handleToggleFavorite();
  };

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
          "& .action-buttons": {
            opacity: 1,
          },
          "& .read-more-btn": {
            bgcolor: "primary.main",
            color: "white",
          },
        },
      }}
    >
      {/* ================= IMAGE ================= */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "66.67%",
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

        {/* Property Type */}
        {type && (
          <Chip
            icon={<Home size={14} />}
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

        {/* Action Buttons - Top Right */}
        <Box
          className="action-buttons"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            gap: 1,
            opacity: { xs: 1, md: 0 }, // Always visible on mobile
            transition: "opacity 0.3s ease",
          }}
        >
          {/* Share Button */}
          <Tooltip title="Chia sẻ" arrow>
            <IconButton
              onClick={handleShare}
              size="small"
              sx={{
                bgcolor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s",
              }}
            >
              <Share2 size={16} className="text-gray-700" />
            </IconButton>
          </Tooltip>

          {/* Favorite Button */}
          <Tooltip title={isFavorited ? "Bỏ lưu" : "Lưu"} arrow>
            <span>
              <IconButton
                onClick={handleFavoriteClick}
                disabled={favoriteLoading}
                size="small"
                sx={{
                  bgcolor: isFavorited ? "rose.50" : "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  "&:hover": {
                    bgcolor: isFavorited ? "rose.100" : "grey.100",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s",
                }}
              >
                <Heart
                  size={16}
                  className={
                    isFavorited
                      ? "fill-rose-600 text-rose-600"
                      : "text-gray-700"
                  }
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Favorite Count Badge */}
        {favoriteCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              bgcolor: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Heart size={12} className="fill-rose-500 text-rose-500" />
            {favoriteCount}
          </Box>
        )}
      </Box>

      {/* ================= CONTENT ================= */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2 }}>
          <MapPin size={16} className="text-gray-500" />
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

        {/* ================= FEATURES ================= */}
        {(bedrooms || bathrooms || size) && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            {bedrooms > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Bed size={18} className="text-gray-500" />
                <Typography variant="body2" color="text.secondary">
                  {bedrooms}
                </Typography>
              </Box>
            )}

            {bathrooms > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Bath size={18} className="text-gray-500" />
                <Typography variant="body2" color="text.secondary">
                  {bathrooms}
                </Typography>
              </Box>
            )}

            {size > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Maximize size={18} className="text-gray-500" />
                <Typography variant="body2" color="text.secondary">
                  {size} m²
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ================= PRICE ================= */}
        <Box sx={{ mt: "auto" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: "1.125rem",
              mb: 1.5,
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

          {/* Read More Button */}
          <Box
            className="read-more-btn"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: "grey.100",
              color: "primary.main",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.2s",
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <span>Xem chi tiết</span>
            <ArrowRight size={16} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
