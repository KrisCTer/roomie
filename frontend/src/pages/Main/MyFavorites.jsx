// web-app/src/pages/Main/MyFavorites.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
} from "@mui/material";
import { Heart, MapPin, Home, Bed, Bath, Maximize, Trash2 } from "lucide-react";
import StickyHeader from "../../components/layout/layoutHome/StickyHeader";
import Footer from "../../components/layout/layoutHome/Footer";
import {
  getMyFavorites,
  removeFavorite,
} from "../../services/favorite.service";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const MyFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await getMyFavorites();

      if (response?.success) {
        setFavorites(response.result || []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId, e) => {
    e.stopPropagation();

    if (!window.confirm("Remove this property from favorites?")) return;

    try {
      setRemoving(propertyId);
      await removeFavorite(propertyId);

      // Update local state
      setFavorites((prev) => prev.filter((p) => p.propertyId !== propertyId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite");
    } finally {
      setRemoving(null);
    }
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
        <StickyHeader forceCompact />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <LoadingSpinner />
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      <StickyHeader forceCompact />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Heart size={32} className="text-rose-500" fill="currentColor" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              My Favorites
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {favorites.length} saved{" "}
            {favorites.length === 1 ? "property" : "properties"}
          </Typography>
        </Box>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "white",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No favorites yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start exploring and save your favorite properties
            </Typography>
            <button
              onClick={() => navigate("/search")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Explore Properties
            </button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((property) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={property.propertyId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    },
                    position: "relative",
                  }}
                  onClick={() => handleViewProperty(property.propertyId)}
                >
                  {/* Remove Button */}
                  <IconButton
                    onClick={(e) =>
                      handleRemoveFavorite(property.propertyId, e)
                    }
                    disabled={removing === property.propertyId}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      zIndex: 1,
                      "&:hover": {
                        bgcolor: "rose.50",
                      },
                    }}
                  >
                    {removing === property.propertyId ? (
                      <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart
                        size={20}
                        className="text-rose-500"
                        fill="currentColor"
                      />
                    )}
                  </IconButton>

                  {/* Property Image */}
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      bgcolor: "grey.100",
                      position: "relative",
                    }}
                  >
                    {property.mediaList && property.mediaList[0] ? (
                      <img
                        src={property.mediaList[0].url}
                        alt={property.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x200?text=No+Image";
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Home size={64} className="text-gray-400" />
                      </Box>
                    )}

                    {/* Status Badge */}
                    {property.propertyStatus === "AVAILABLE" && (
                      <Chip
                        label="Available"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          bgcolor: "green.600",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </CardMedia>

                  {/* Property Details */}
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        fontSize: "1rem",
                      }}
                    >
                      {property.title}
                    </Typography>

                    {/* Location */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1.5,
                      }}
                    >
                      <MapPin size={16} className="text-gray-500" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {property.address?.district},{" "}
                        {property.address?.province}
                      </Typography>
                    </Box>

                    {/* Features */}
                    <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                      {property.bedrooms > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Bed size={16} className="text-gray-500" />
                          <Typography variant="caption" color="text.secondary">
                            {property.bedrooms}
                          </Typography>
                        </Box>
                      )}
                      {property.bathrooms > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Bath size={16} className="text-gray-500" />
                          <Typography variant="caption" color="text.secondary">
                            {property.bathrooms}
                          </Typography>
                        </Box>
                      )}
                      {property.size > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Maximize size={16} className="text-gray-500" />
                          <Typography variant="caption" color="text.secondary">
                            {property.size}m²
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Price */}
                    <Box
                      sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      >
                        {property.monthlyRent?.toLocaleString()}đ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /tháng
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default MyFavorites;
