import React from "react";
import { Box, Divider, Slider, Switch, Typography } from "@mui/material";
import { MapPin, Navigation, X } from "lucide-react";
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  DEFAULT_FILTERS,
  PROPERTY_TYPES,
  RADIUS_OPTIONS,
  summaryChipStyle,
} from "../utils/filterOptions";

const SearchFiltersContentSection = ({
  localFilters,
  setLocalFilters,
  activeFilterCount,
}) => {
  const [gettingLocation, setGettingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocalFilters({
          ...localFilters,
          nearbyEnabled: true,
          nearbyLat: position.coords.latitude,
          nearbyLng: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        let msg = "Không thể lấy vị trí. ";
        if (error.code === error.PERMISSION_DENIED) {
          msg += "Vui lòng cho phép truy cập vị trí trong trình duyệt.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg += "Thông tin vị trí không khả dụng.";
        } else {
          msg += "Yêu cầu hết thời gian chờ.";
        }
        setLocationError(msg);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  const handleClearNearby = () => {
    setLocalFilters({
      ...localFilters,
      nearbyEnabled: false,
      nearbyLat: null,
      nearbyLng: null,
      nearbyRadiusKm: 5,
    });
    setLocationError(null);
  };

  return (
    <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 3 }}>
      {activeFilterCount > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.2 }}>
            Dang loc theo
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {(localFilters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
              localFilters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) && (
              <Box sx={summaryChipStyle}>
                Gia: {localFilters.priceRange[0].toLocaleString("vi-VN")}d -{" "}
                {localFilters.priceRange[1].toLocaleString("vi-VN")}d
              </Box>
            )}
            {localFilters.propertyTypes.length > 0 && (
              <Box sx={summaryChipStyle}>
                Loai hinh: {localFilters.propertyTypes.length}
              </Box>
            )}
            {localFilters.bedrooms > 0 && (
              <Box sx={summaryChipStyle}>
                Phong ngu:{" "}
                {localFilters.bedrooms === 4 ? "4+" : localFilters.bedrooms}
              </Box>
            )}
            {localFilters.bathrooms > 0 && (
              <Box sx={summaryChipStyle}>
                Phong tam:{" "}
                {localFilters.bathrooms === 3 ? "3+" : localFilters.bathrooms}
              </Box>
            )}
            {localFilters.nearbyEnabled && (
              <Box sx={summaryChipStyle}>
                📍 Quanh day: {localFilters.nearbyRadiusKm}km
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Nearby Search Section */}
      <Box
        sx={{
          mb: 4,
          p: 2.5,
          border: "2px solid",
          borderColor: localFilters.nearbyEnabled ? "#059669" : "#E6DDD0",
          borderRadius: 3,
          bgcolor: localFilters.nearbyEnabled ? "#ECFDF5" : "#FEFBF6",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MapPin size={18} color={localFilters.nearbyEnabled ? "#059669" : "#92400E"} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Tim quanh day
            </Typography>
          </Box>
          {localFilters.nearbyEnabled && (
            <Box
              onClick={handleClearNearby}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                color: "#DC2626",
                fontSize: 13,
                fontWeight: 600,
                "&:hover": { opacity: 0.7 },
              }}
            >
              <X size={14} />
              Tat
            </Box>
          )}
        </Box>

        {!localFilters.nearbyEnabled ? (
          <Box
            onClick={handleGetLocation}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 2,
              px: 3,
              bgcolor: "#065F46",
              color: "white",
              borderRadius: 2,
              cursor: gettingLocation ? "wait" : "pointer",
              fontWeight: 700,
              fontSize: 14,
              transition: "all 0.2s",
              opacity: gettingLocation ? 0.7 : 1,
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {gettingLocation ? (
              <>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
                Dang lay vi tri...
              </>
            ) : (
              <>
                <Navigation size={16} />
                📍 Dung vi tri hien tai
              </>
            )}
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                p: 1.5,
                bgcolor: "#D1FAE5",
                borderRadius: 2,
              }}
            >
              <Navigation size={14} color="#059669" />
              <Typography sx={{ fontSize: 13, color: "#065F46", fontWeight: 600 }}>
                Vi tri da xac dinh ✓
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{ fontWeight: 700, mb: 1.5, color: "#1F2937" }}
            >
              Ban kinh tim kiem: {localFilters.nearbyRadiusKm}km
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {RADIUS_OPTIONS.map((r) => (
                <Box
                  key={r}
                  onClick={() =>
                    setLocalFilters({ ...localFilters, nearbyRadiusKm: r })
                  }
                  sx={{
                    px: 2,
                    py: 1,
                    border: "2px solid",
                    borderColor:
                      localFilters.nearbyRadiusKm === r ? "#059669" : "#D1D5DB",
                    borderRadius: 2,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                    bgcolor:
                      localFilters.nearbyRadiusKm === r ? "#ECFDF5" : "white",
                    color:
                      localFilters.nearbyRadiusKm === r ? "#065F46" : "#374151",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "#059669", bgcolor: "#F0FDF4" },
                  }}
                >
                  {r}km
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {locationError && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 12,
              color: "#DC2626",
              fontWeight: 500,
            }}
          >
            {locationError}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3, borderColor: "#EFE6DA" }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Khoang gia (VND/thang)
        </Typography>
        <Slider
          value={localFilters.priceRange}
          onChange={(_, value) =>
            setLocalFilters({ ...localFilters, priceRange: value })
          }
          valueLabelDisplay="auto"
          min={0}
          max={50000000}
          step={1000000}
          valueLabelFormat={(value) => `${(value / 1000000).toFixed(0)}M`}
          sx={{
            mb: 2,
            color: "#EA580C",
            "& .MuiSlider-thumb": {
              bgcolor: "#FFFFFF",
              border: "2px solid #EA580C",
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 3, borderColor: "#EFE6DA" }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Loai hinh bat dong san
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
        >
          {PROPERTY_TYPES.map((type) => (
            <Box
              key={type.value}
              onClick={() => {
                const newTypes = localFilters.propertyTypes.includes(type.value)
                  ? localFilters.propertyTypes.filter((t) => t !== type.value)
                  : [...localFilters.propertyTypes, type.value];
                setLocalFilters({ ...localFilters, propertyTypes: newTypes });
              }}
              sx={{
                px: 2,
                py: 2,
                border: "2px solid",
                borderColor: localFilters.propertyTypes.includes(type.value)
                  ? "#C2410C"
                  : "#E6DDD0",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                bgcolor: localFilters.propertyTypes.includes(type.value)
                  ? "#FFF4E8"
                  : "transparent",
                "&:hover": { borderColor: "#C2410C", bgcolor: "#FFF7ED" },
              }}
            >
              <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>
                {type.icon}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                {type.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderColor: "#EFE6DA" }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Phong ngu
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {BEDROOM_OPTIONS.map((option) => (
            <Box
              key={option.value}
              onClick={() =>
                setLocalFilters({ ...localFilters, bedrooms: option.value })
              }
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: "center",
                border: "2px solid",
                borderColor:
                  localFilters.bedrooms === option.value
                    ? "#C2410C"
                    : "#E6DDD0",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                bgcolor:
                  localFilters.bedrooms === option.value
                    ? "#FFF4E8"
                    : "transparent",
                "&:hover": { borderColor: "#C2410C", bgcolor: "#FFF7ED" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Phong tam
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {BATHROOM_OPTIONS.map((option) => (
            <Box
              key={option.value}
              onClick={() =>
                setLocalFilters({ ...localFilters, bathrooms: option.value })
              }
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: "center",
                border: "2px solid",
                borderColor:
                  localFilters.bathrooms === option.value
                    ? "#C2410C"
                    : "#E6DDD0",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                bgcolor:
                  localFilters.bathrooms === option.value
                    ? "#FFF4E8"
                    : "transparent",
                "&:hover": { borderColor: "#C2410C", bgcolor: "#FFF7ED" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SearchFiltersContentSection;

