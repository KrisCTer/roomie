import React from "react";
import { Box, Divider, Slider, Typography } from "@mui/material";
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  DEFAULT_FILTERS,
  PROPERTY_TYPES,
  summaryChipStyle,
} from "../utils/filterOptions";

const SearchFiltersContentSection = ({
  localFilters,
  setLocalFilters,
  activeFilterCount,
}) => {
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
          </Box>
        </Box>
      )}

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
