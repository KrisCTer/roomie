// src/components/PropertySearch/SearchFilters.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Typography,
  Slider,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

const SearchFilters = ({ filters, onFilterChange, open, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const propertyTypes = [
    { value: "ROOM", label: "Phòng trọ", icon: "🏠" },
    { value: "APARTMENT", label: "Căn hộ", icon: "🏢" },
    { value: "HOUSE", label: "Nhà nguyên căn", icon: "🏘️" },
    { value: "STUDIO", label: "Studio", icon: "🛋️" },
    { value: "VILLA", label: "Biệt thự", icon: "🏰" },
    { value: "DORMITORY", label: "Ký túc xá", icon: "🏫" },
  ];

  const bedroomOptions = [
    { value: 0, label: "Bất kỳ" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4+" },
  ];

  const bathroomOptions = [
    { value: 0, label: "Bất kỳ" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3+" },
  ];

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      priceRange: [0, 50000000],
      propertyTypes: [],
      bedrooms: 0,
      bathrooms: 0,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          borderRadius: { xs: 0, sm: "16px 0 0 16px" },
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Bộ lọc
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 3 }}>
          {/* Price Range */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Khoảng giá (VND/tháng)
            </Typography>
            <Slider
              value={localFilters.priceRange}
              onChange={(e, value) =>
                setLocalFilters({ ...localFilters, priceRange: value })
              }
              valueLabelDisplay="auto"
              min={0}
              max={50000000}
              step={1000000}
              valueLabelFormat={(value) => `${(value / 1000000).toFixed(0)}M`}
              sx={{ mb: 2 }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.5,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "grey.600" }}>
                  Tối thiểu
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {localFilters.priceRange[0].toLocaleString("vi-VN")} đ
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.5,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "grey.600" }}>
                  Tối đa
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {localFilters.priceRange[1].toLocaleString("vi-VN")} đ
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Property Types */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Loại hình bất động sản
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 2,
              }}
            >
              {propertyTypes.map((type) => (
                <Box
                  key={type.value}
                  onClick={() => {
                    const newTypes = localFilters.propertyTypes.includes(
                      type.value
                    )
                      ? localFilters.propertyTypes.filter(
                          (t) => t !== type.value
                        )
                      : [...localFilters.propertyTypes, type.value];
                    setLocalFilters({
                      ...localFilters,
                      propertyTypes: newTypes,
                    });
                  }}
                  sx={{
                    px: 2,
                    py: 2,
                    border: "2px solid",
                    borderColor: localFilters.propertyTypes.includes(type.value)
                      ? "grey.900"
                      : "grey.200",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor: localFilters.propertyTypes.includes(type.value)
                      ? "grey.50"
                      : "transparent",
                    "&:hover": {
                      borderColor: "grey.900",
                      bgcolor: "grey.50",
                    },
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

          <Divider sx={{ my: 3 }} />

          {/* Bedrooms */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Phòng ngủ
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {bedroomOptions.map((option) => (
                <Box
                  key={option.value}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      bedrooms: option.value,
                    })
                  }
                  sx={{
                    flex: 1,
                    py: 1.5,
                    textAlign: "center",
                    border: "2px solid",
                    borderColor:
                      localFilters.bedrooms === option.value
                        ? "grey.900"
                        : "grey.200",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor:
                      localFilters.bedrooms === option.value
                        ? "grey.50"
                        : "transparent",
                    "&:hover": {
                      borderColor: "grey.900",
                      bgcolor: "grey.50",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bathrooms */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Phòng tắm
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {bathroomOptions.map((option) => (
                <Box
                  key={option.value}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      bathrooms: option.value,
                    })
                  }
                  sx={{
                    flex: 1,
                    py: 1.5,
                    textAlign: "center",
                    border: "2px solid",
                    borderColor:
                      localFilters.bathrooms === option.value
                        ? "grey.900"
                        : "grey.200",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor:
                      localFilters.bathrooms === option.value
                        ? "grey.50"
                        : "transparent",
                    "&:hover": {
                      borderColor: "grey.900",
                      bgcolor: "grey.50",
                    },
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

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Button
            onClick={handleReset}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              textDecoration: "underline",
              color: "grey.900",
            }}
          >
            Xóa tất cả
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "grey.900",
              "&:hover": { bgcolor: "grey.800" },
            }}
          >
            Hiển thị kết quả
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SearchFilters;
