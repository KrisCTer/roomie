// src/components/layout/layoutHome/SearchBar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  InputBase,
  Button,
  Menu,
  MenuItem,
  Typography,
  Slider,
  Select,
  Divider,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Home as PropertyIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const SearchBar = ({ compact = false, onSearch }) => {
  const navigate = useNavigate();

  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    priceRange: [0, 20000000],
  });

  // Location suggestions
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Price filter
  const [priceAnchorEl, setPriceAnchorEl] = useState(null);

  // Compact mode search
  const [compactSearchOpen, setCompactSearchOpen] = useState(false);
  const [compactAnchorEl, setCompactAnchorEl] = useState(null);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState([]);

  // Popular locations
  const popularLocations = [
    { province: "Hồ Chí Minh", district: "Quận 1" },
    { province: "Hồ Chí Minh", district: "Quận 7" },
    { province: "Hà Nội", district: "Ba Đình" },
    { province: "Hà Nội", district: "Cầu Giấy" },
    { province: "Đà Nẵng", district: "Hải Châu" },
  ];

  // Load provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=2")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));

    // Load recent searches
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const propertyTypes = [
    { value: "", label: "Tất cả loại hình" },
    { value: "ROOM", label: "Phòng trọ" },
    { value: "DORMITORY", label: "Ký túc xá" },
    { value: "APARTMENT", label: "Căn hộ chung cư" },
    { value: "STUDIO", label: "Căn hộ Studio" },
    { value: "OFFICETEL", label: "Officetel" },
    { value: "HOUSE", label: "Nhà nguyên căn" },
    { value: "VILLA", label: "Biệt thự" },
    { value: "OTHER", label: "Loại khác" },
  ];

  const handleSearch = () => {
    // Save to recent searches
    if (searchData.location) {
      const newRecent = [
        { location: searchData.location, timestamp: Date.now() },
        ...recentSearches.filter((s) => s.location !== searchData.location),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));
    }

    // Close compact menu if open
    setCompactSearchOpen(false);

    // Navigate to search page with params
    const params = new URLSearchParams();
    if (searchData.location) params.set("location", searchData.location);
    if (searchData.propertyType) params.set("type", searchData.propertyType);
    if (searchData.priceRange[0] > 0)
      params.set("minPrice", searchData.priceRange[0]);
    if (searchData.priceRange[1] < 50000000)
      params.set("maxPrice", searchData.priceRange[1]);

    navigate(`/search?${params.toString()}`);
    if (onSearch) onSearch();
  };

  const closeLocationMenu = () => {
    setLocationAnchorEl(null);
    setShowSuggestions(false);
    setSelectedProvince(null);
    setDistricts([]);
  };

  const handleSelectLocation = (location) => {
    setSearchData({ ...searchData, location });
    closeLocationMenu();
    setCompactSearchOpen(false);
  };

  const handleSelectProvince = (province) => {
    setSelectedProvince(province);
    setDistricts(province.districts || []);
  };

  const handleSelectDistrict = (district) => {
    const locationText = `${district.name}, ${selectedProvince.name}`;
    setSearchData((prev) => ({ ...prev, location: locationText }));
    closeLocationMenu();
    setTimeout(handleSearch, 0);
  };

  const handleQuickSearch = (location) => {
    setSearchData((prev) => ({ ...prev, location }));
    setTimeout(handleSearch, 0);
  };

  // ==================== COMPACT MODE ====================
  if (compact) {
    return (
      <>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            px: 2,
            py: 0.5,
            minWidth: 380,
            border: "1px solid",
            borderColor: "grey.300",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderColor: "grey.400",
            },
          }}
          onClick={(e) => {
            setCompactAnchorEl(e.currentTarget);
            setCompactSearchOpen(true);
          }}
        >
          <SearchIcon sx={{ color: "grey.600", mr: 1, fontSize: 20 }} />

          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: searchData.location ? "grey.900" : "grey.500",
            }}
          >
            {searchData.location || "Tìm kiếm địa điểm..."}
          </Typography>

          {searchData.location && (
            <>
              <Typography sx={{ mx: 1, color: "grey.400" }}>·</Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "grey.600" }}>
                {searchData.propertyType
                  ? propertyTypes.find(
                      (p) => p.value === searchData.propertyType
                    )?.label
                  : "Tất cả"}
              </Typography>
            </>
          )}
        </Paper>

        {/* Compact Search Menu */}
        <Menu
          anchorEl={compactAnchorEl}
          open={compactSearchOpen}
          onClose={() => {
            setCompactSearchOpen(false);
            setSelectedProvince(null);
            setDistricts([]);
          }}
          PaperProps={{
            sx: {
              width: 420,
              maxHeight: 500,
              borderRadius: 3,
              mt: 1,
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Tìm kiếm nhanh
            </Typography>
          </Box>

          {/* ====== CHỌN TỈNH / GỢI Ý ====== */}
          {!selectedProvince && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <>
                  <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "grey.600",
                        textTransform: "uppercase",
                      }}
                    >
                      Tìm kiếm gần đây
                    </Typography>
                  </Box>

                  {recentSearches.slice(0, 3).map((search, index) => (
                    <MenuItem
                      key={`recent-${index}`}
                      onClick={() => handleQuickSearch(search.location)}
                    >
                      <ListItemIcon>
                        <HistoryIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={search.location} />
                    </MenuItem>
                  ))}

                  <Divider sx={{ my: 1 }} />
                </>
              )}

              {/* Popular Locations */}
              <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "grey.600",
                    textTransform: "uppercase",
                  }}
                >
                  Địa điểm phổ biến
                </Typography>
              </Box>

              {popularLocations.map((loc, index) => (
                <MenuItem
                  key={`popular-${index}`}
                  onClick={() =>
                    handleQuickSearch(`${loc.district}, ${loc.province}`)
                  }
                >
                  <ListItemIcon>
                    <TrendingIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={`${loc.district}, ${loc.province}`} />
                </MenuItem>
              ))}

              <Divider sx={{ my: 1 }} />

              {/* All Provinces */}
              <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "grey.600",
                    textTransform: "uppercase",
                  }}
                >
                  Chọn tỉnh / thành
                </Typography>
              </Box>

              <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                {provinces.map((p) => (
                  <MenuItem
                    key={`province-${p.code}`}
                    onClick={() => handleSelectProvince(p)}
                  >
                    <ListItemIcon>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={p.name} />
                  </MenuItem>
                ))}
              </Box>
            </>
          )}

          {/* ====== CHỌN QUẬN / HUYỆN ====== */}
          {selectedProvince && (
            <>
              <MenuItem
                onClick={() => {
                  setSelectedProvince(null);
                  setDistricts([]);
                }}
                sx={{
                  fontWeight: 600,
                  borderBottom: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                ← Quay lại
              </MenuItem>

              <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "grey.600" }}
                >
                  {selectedProvince.name}
                </Typography>
              </Box>

              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {districts.map((d) => (
                  <MenuItem
                    key={`district-${d.code}`}
                    onClick={() => handleSelectDistrict(d)}
                  >
                    {d.name}
                  </MenuItem>
                ))}
              </Box>
            </>
          )}
        </Menu>
      </>
    );
  }

  // ==================== FULL MODE ====================
  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        borderRadius: 4,
        overflow: "hidden",
        maxWidth: 900,
        mx: "auto",
        bgcolor: "white",
      }}
    >
      {/* Location with Suggestions */}
      <Box
        sx={{
          flex: 1,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRight: { xs: "none", md: "1px solid" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "grey.200",
          position: "relative",
        }}
      >
        <LocationIcon sx={{ color: "primary.main", fontSize: 24 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "grey.900",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: 0.5,
            }}
          >
            Địa điểm
          </Typography>
          <InputBase
            fullWidth
            placeholder="Chọn quận, thành phố..."
            value={searchData.location}
            onChange={(e) => {
              setSearchData({ ...searchData, location: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={(e) => {
              setLocationAnchorEl(e.currentTarget);
              setShowSuggestions(true);
            }}
            sx={{
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          />

          {/* Suggestions Dropdown */}
          <Menu
            anchorEl={locationAnchorEl}
            open={Boolean(locationAnchorEl) && showSuggestions}
            onClose={() => {
              closeLocationMenu();
            }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 400,
                borderRadius: 2,
                mt: 0.5,
              },
            }}
          >
            {/* VIEW: CHỌN TỈNH / GỢI Ý */}
            {!selectedProvince && (
              <>
                {recentSearches.length > 0 && (
                  <>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "grey.600",
                          textTransform: "uppercase",
                        }}
                      >
                        Tìm kiếm gần đây
                      </Typography>
                    </Box>

                    {recentSearches.map((search, index) => (
                      <MenuItem
                        key={`recent-${index}`}
                        onClick={() => handleSelectLocation(search.location)}
                      >
                        <ListItemIcon>
                          <HistoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={search.location} />
                      </MenuItem>
                    ))}

                    <Divider sx={{ my: 1 }} />
                  </>
                )}

                <Box sx={{ px: 2, py: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "grey.600",
                      textTransform: "uppercase",
                    }}
                  >
                    Địa điểm phổ biến
                  </Typography>
                </Box>

                {popularLocations.map((loc, index) => (
                  <MenuItem
                    key={`popular-${index}`}
                    onClick={() =>
                      handleSelectLocation(`${loc.district}, ${loc.province}`)
                    }
                  >
                    <ListItemIcon>
                      <TrendingIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${loc.district}, ${loc.province}`}
                    />
                  </MenuItem>
                ))}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ px: 2, py: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "grey.600",
                      textTransform: "uppercase",
                    }}
                  >
                    Tất cả tỉnh / thành
                  </Typography>
                </Box>

                {provinces.map((p) => (
                  <MenuItem
                    key={`province-${p.code}`}
                    onClick={() => handleSelectProvince(p)}
                  >
                    <ListItemIcon>
                      <LocationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={p.name} />
                  </MenuItem>
                ))}
              </>
            )}

            {/* VIEW: CHỌN QUẬN / HUYỆN */}
            {selectedProvince && (
              <>
                <MenuItem
                  onClick={() => {
                    setSelectedProvince(null);
                    setDistricts([]);
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  ← Quay lại
                </MenuItem>

                <Divider />

                {districts.map((d) => (
                  <MenuItem
                    key={`district-${d.code}`}
                    onClick={() => handleSelectDistrict(d)}
                  >
                    {d.name}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        </Box>
      </Box>

      {/* Property Type */}
      <Box
        sx={{
          flex: 1,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRight: { xs: "none", md: "1px solid" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "grey.200",
        }}
      >
        <PropertyIcon sx={{ color: "primary.main", fontSize: 24 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "grey.900",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: 0.5,
            }}
          >
            Loại hình
          </Typography>
          <Select
            fullWidth
            value={searchData.propertyType}
            onChange={(e) =>
              setSearchData({ ...searchData, propertyType: e.target.value })
            }
            displayEmpty
            variant="standard"
            disableUnderline
            sx={{
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            {propertyTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Price Range */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRight: { xs: "none", md: "1px solid" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "grey.200",
          cursor: "pointer",
        }}
        onClick={(e) => setPriceAnchorEl(e.currentTarget)}
      >
        <PriceIcon sx={{ color: "primary.main", fontSize: 24 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "grey.900",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: 0.5,
            }}
          >
            Giá thuê
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "0.95rem", fontWeight: 500, color: "grey.700" }}
          >
            {searchData.priceRange[0].toLocaleString("vi-VN")} -{" "}
            {searchData.priceRange[1].toLocaleString("vi-VN")} đ
          </Typography>
        </Box>
      </Box>

      {/* Search Button */}
      <Box sx={{ px: 2, py: 2 }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "none",
            bgcolor: "primary.main",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            "&:hover": {
              bgcolor: "primary.dark",
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.4)",
            },
          }}
        >
          Tìm kiếm
        </Button>
      </Box>

      {/* Price Range Menu */}
      <Menu
        anchorEl={priceAnchorEl}
        open={Boolean(priceAnchorEl)}
        onClose={() => setPriceAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            width: 320,
            p: 2,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Khoảng giá thuê (VND/tháng)
        </Typography>

        <Slider
          value={searchData.priceRange}
          onChange={(e, newValue) =>
            setSearchData({ ...searchData, priceRange: newValue })
          }
          valueLabelDisplay="auto"
          min={0}
          max={50000000}
          step={1000000}
          valueLabelFormat={(value) => `${(value / 1000000).toFixed(0)}M`}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: "grey.600" }}>
              Tối thiểu
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {searchData.priceRange[0].toLocaleString("vi-VN")} đ
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: "grey.600" }}>
              Tối đa
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {searchData.priceRange[1].toLocaleString("vi-VN")} đ
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={() => setPriceAnchorEl(null)}
          sx={{
            mt: 2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Áp dụng
        </Button>
      </Menu>
    </Paper>
  );
};

export default SearchBar;
