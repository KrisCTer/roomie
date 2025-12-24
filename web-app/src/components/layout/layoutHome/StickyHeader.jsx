// src/components/Home/StickyHeader.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Fade,
  Paper,
  Divider,
  ListItemIcon,
  ListItemText,
  Slider,
  Switch,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Home as PropertyIcon,
  AttachMoney as PriceIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  isAuthenticated,
  removeToken,
} from "../../../services/localStorageService";
import SearchFilters from "../../PropertySearch/SearchFilters";
import NotificationDropdown from "../../Notification/NotificationDropdown";
import { useNotificationContext } from "../../../contexts/NotificationContext";

const StickyHeader = ({
  forceCompact = false,
  showFilters = false,
  filters = null,
  onFilterChange = null,
  filterCount = 0,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const loggedIn = isAuthenticated();

  const [scrolled, setScrolled] = useState(forceCompact);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  // Search state
  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    priceRange: [0, 20000000],
  });

  // Menu anchors
  const [locationAnchor, setLocationAnchor] = useState(null);
  const [typeAnchor, setTypeAnchor] = useState(null);
  const [priceAnchor, setPriceAnchor] = useState(null);
  const { unreadCount } = useNotificationContext();

  // Location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const popularLocations = [
    { province: "Hồ Chí Minh", district: "Quận 1" },
    { province: "Hồ Chí Minh", district: "Quận 7" },
    { province: "Hà Nội", district: "Ba Đình" },
    { province: "Hà Nội", district: "Cầu Giấy" },
    { province: "Đà Nẵng", district: "Hải Châu" },
  ];

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

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  ];

  // Load provinces and recent searches
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=2")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));

    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Detect scroll
  useEffect(() => {
    // If forceCompact is true, always show compact mode
    if (forceCompact) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceCompact]);

  // Handle theme change
  const handleThemeToggle = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { darkMode: newTheme } })
    );
  };

  // Handle language change
  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  // User menu
  const openMenu = Boolean(anchorEl);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const openNotifications = Boolean(notificationAnchor);
  const handleOpenNotifications = (event) => {
    setNotificationAnchor(event.currentTarget);
  };
  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    removeToken();
    handleCloseMenu();
    navigate("/login");
  };

  // Get user info
  const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  };

  const getUsername = () => {
    const user = getStoredUser();
    const fromUser =
      user?.username || user?.userName || user?.name || user?.email || "";
    const fromKey = localStorage.getItem("username");
    return (fromUser || fromKey || "").toString().trim();
  };

  const handleDashboardClick = () => {
    const username = getUsername().toLowerCase();
    if (username === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  // Search handlers
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

    // Close all menus
    setLocationAnchor(null);
    setTypeAnchor(null);
    setPriceAnchor(null);

    // Navigate to search page
    const params = new URLSearchParams();
    if (searchData.location) params.set("location", searchData.location);
    if (searchData.propertyType) params.set("type", searchData.propertyType);
    if (searchData.priceRange[0] > 0)
      params.set("minPrice", searchData.priceRange[0]);
    if (searchData.priceRange[1] < 50000000)
      params.set("maxPrice", searchData.priceRange[1]);

    navigate(`/search?${params.toString()}`);
  };

  const handleSelectProvince = (province) => {
    setSelectedProvince(province);
    setDistricts(province.districts || []);
  };

  const handleSelectDistrict = (district) => {
    const locationText = `${district.name}, ${selectedProvince.name}`;
    setSearchData({ ...searchData, location: locationText });
    setLocationAnchor(null);
    setSelectedProvince(null);
    setDistricts([]);
  };

  const handleQuickSearch = (location) => {
    setSearchData((prev) => ({ ...prev, location }));
    setLocationAnchor(null);
    setTimeout(handleSearch, 0);
  };

  const username = getUsername();
  const isAdmin = username?.toLowerCase() === "admin";
  const currentLanguage = i18n.language || "en";

  return (
    <>
      <AppBar
        position="sticky"
        elevation={scrolled ? 2 : 0}
        sx={{
          bgcolor: scrolled
            ? "rgba(255, 255, 255, 0.98)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: scrolled ? "1px solid" : "none",
          borderColor: "grey.200",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          py: scrolled ? 0.5 : 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: scrolled ? 64 : 80,
              transition: "min-height 0.3s ease",
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
              onClick={() => navigate("/")}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: scrolled ? "1.5rem" : "1.75rem",
                  transition: "font-size 0.3s ease",
                }}
              >
                Roomie
              </Typography>
            </Box>

            {/* Center: Functional Compact Search (when scrolled) */}
            <Fade in={scrolled}>
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  maxWidth: 720,
                  px: 2,
                  display: scrolled ? "block" : "none",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 999,
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      borderColor: "grey.400",
                    },
                  }}
                >
                  {/* Location Button */}
                  <Box
                    onClick={(e) => setLocationAnchor(e.currentTarget)}
                    sx={{
                      flex: 1,
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 18, color: "grey.500" }} />
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: searchData.location ? "grey.900" : "grey.500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {searchData.location || "Địa điểm"}
                    </Typography>
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* Property Type Button */}
                  <Box
                    onClick={(e) => setTypeAnchor(e.currentTarget)}
                    sx={{
                      flex: 1,
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  >
                    <PropertyIcon sx={{ fontSize: 18, color: "grey.500" }} />
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: searchData.propertyType
                          ? "grey.900"
                          : "grey.500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {searchData.propertyType
                        ? propertyTypes.find(
                            (p) => p.value === searchData.propertyType
                          )?.label
                        : "Loại hình"}
                    </Typography>
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* Price Range Button */}
                  <Box
                    onClick={(e) => setPriceAnchor(e.currentTarget)}
                    sx={{
                      flex: 1,
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  >
                    <PriceIcon sx={{ fontSize: 18, color: "grey.500" }} />
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color:
                          searchData.priceRange[0] !== 0 ||
                          searchData.priceRange[1] !== 20000000
                            ? "grey.900"
                            : "grey.500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {searchData.priceRange[0] === 0 &&
                      searchData.priceRange[1] === 20000000
                        ? "Giá thuê"
                        : `${(searchData.priceRange[0] / 1000000).toFixed(
                            0
                          )}-${(searchData.priceRange[1] / 1000000).toFixed(
                            0
                          )}M`}
                    </Typography>
                  </Box>

                  {/* Filter Button (for PropertySearch) */}
                  {showFilters && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      <Box
                        onClick={() => setShowFilterDrawer(true)}
                        sx={{
                          px: 2,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "grey.50" },
                        }}
                      >
                        <Badge badgeContent={filterCount} color="primary">
                          <FilterListIcon
                            sx={{ fontSize: 18, color: "grey.500" }}
                          />
                        </Badge>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: filterCount > 0 ? "grey.900" : "grey.500",
                          }}
                        >
                          Lọc
                        </Typography>
                      </Box>
                    </>
                  )}

                  {/* Search Button */}
                  <Box
                    onClick={handleSearch}
                    sx={{
                      bgcolor: "primary.main",
                      px: 2.5,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 20, color: "white" }} />
                  </Box>
                </Paper>

                {/* Location Menu */}
                <Menu
                  anchorEl={locationAnchor}
                  open={Boolean(locationAnchor)}
                  onClose={() => {
                    setLocationAnchor(null);
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
                      Chọn địa điểm
                    </Typography>
                  </Box>

                  {!selectedProvince ? (
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
                            handleQuickSearch(
                              `${loc.district}, ${loc.province}`
                            )
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
                  ) : (
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

                {/* Property Type Menu */}
                <Menu
                  anchorEl={typeAnchor}
                  open={Boolean(typeAnchor)}
                  onClose={() => setTypeAnchor(null)}
                  PaperProps={{
                    sx: {
                      width: 320,
                      borderRadius: 2,
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
                      Loại hình bất động sản
                    </Typography>
                  </Box>
                  {propertyTypes.map((type) => (
                    <MenuItem
                      key={type.value}
                      onClick={() => {
                        setSearchData({
                          ...searchData,
                          propertyType: type.value,
                        });
                        setTypeAnchor(null);
                      }}
                      selected={searchData.propertyType === type.value}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Menu>

                {/* Price Range Menu */}
                <Menu
                  anchorEl={priceAnchor}
                  open={Boolean(priceAnchor)}
                  onClose={() => setPriceAnchor(null)}
                  PaperProps={{
                    sx: {
                      width: 320,
                      borderRadius: 2,
                      mt: 1,
                      p: 2,
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
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
                    valueLabelFormat={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                    sx={{ mb: 2 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      mb: 2,
                    }}
                  >
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
                    onClick={() => setPriceAnchor(null)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Áp dụng
                  </Button>
                </Menu>
              </Box>
            </Fade>

            {/* Right Side */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!loggedIn ? (
                <>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      textTransform: "none",
                      fontWeight: 600,
                      color: "grey.800",
                      px: 2,
                      "&:hover": {
                        bgcolor: "grey.100",
                      },
                    }}
                  >
                    {t("header.becomeHost") || "Cho thuê nhà"}
                  </Button>

                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.5,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={() => navigate("/login")}
                  >
                    <MenuIcon sx={{ fontSize: 20, color: "grey.700" }} />
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "grey.600" }}>
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </Paper>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleDashboardClick}
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      textTransform: "none",
                      fontWeight: 600,
                      color: "grey.800",
                      px: 2,
                      "&:hover": {
                        bgcolor: "grey.100",
                      },
                    }}
                  >
                    {isAdmin
                      ? "Admin Dashboard"
                      : t("header.becomeHost") || "Cho thuê nhà"}
                  </Button>
                  {/* ⭐ NOTIFICATION BELL - Elegant Design */}
                  <IconButton
                    onClick={handleOpenNotifications}
                    sx={{
                      color: "grey.700",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "grey.100",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      max={99}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.65rem",
                          height: 18,
                          minWidth: 18,
                          fontWeight: 700,
                        },
                      }}
                    >
                      <NotificationsIcon sx={{ fontSize: 24 }} />
                    </Badge>
                  </IconButton>

                  {/* ⭐ Notification Dropdown */}
                  <NotificationDropdown
                    anchorEl={notificationAnchor}
                    open={openNotifications}
                    onClose={handleCloseNotifications}
                  />
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.5,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={handleOpenMenu}
                  >
                    <MenuIcon sx={{ fontSize: 20, color: "grey.700" }} />
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                      }}
                    >
                      {username ? username[0].toUpperCase() : "U"}
                    </Avatar>
                  </Paper>

                  {/* Enhanced User Menu with Settings */}
                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: 280,
                        "& .MuiMenuItem-root": {
                          px: 2,
                          py: 1.5,
                          fontSize: "0.875rem",
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    {/* User Profile Section */}
                    {!isAdmin && (
                      <MenuItem
                        onClick={() => {
                          handleCloseMenu();
                          navigate("/profile");
                        }}
                      >
                        <ListItemIcon>
                          <AccountCircleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={t("header.myProfile") || "Hồ sơ"}
                        />
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        navigate("/notifications");
                      }}
                    >
                      <ListItemIcon>
                        <NotificationsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("header.notifications") || "Thông báo"}
                      />
                      {unreadCount > 0 && (
                        <Badge
                          badgeContent={unreadCount}
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        handleDashboardClick();
                      }}
                    >
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          isAdmin
                            ? "Admin Dashboard"
                            : t("header.hostDashboard") || "Quản lý nhà"
                        }
                      />
                    </MenuItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Language Selection */}
                    <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "grey.600",
                          textTransform: "uppercase",
                        }}
                      >
                        Ngôn ngữ / Language
                      </Typography>
                    </Box>
                    {languages.map((lang) => (
                      <MenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        selected={currentLanguage === lang.code}
                        sx={{
                          bgcolor:
                            currentLanguage === lang.code
                              ? "primary.light"
                              : "transparent",
                        }}
                      >
                        <ListItemIcon>
                          <Typography fontSize="1.25rem">
                            {lang.flag}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={lang.label}
                          sx={{
                            "& .MuiTypography-root": {
                              fontWeight:
                                currentLanguage === lang.code ? 600 : 400,
                            },
                          }}
                        />
                      </MenuItem>
                    ))}

                    <Divider sx={{ my: 1 }} />

                    {/* Theme Toggle */}
                    <MenuItem onClick={handleThemeToggle}>
                      <ListItemIcon>
                        {darkMode ? (
                          <LightModeIcon fontSize="small" />
                        ) : (
                          <DarkModeIcon fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={darkMode ? "Chế độ sáng" : "Chế độ tối"}
                      />
                      <Switch
                        checked={darkMode}
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </MenuItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Logout */}
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        color: "error.main",
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon
                          fontSize="small"
                          sx={{ color: "error.main" }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("common.logout") || "Đăng xuất"}
                      />
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Filter Drawer - Only shown on PropertySearch page */}
      {showFilters && filters && onFilterChange && (
        <SearchFilters
          filters={filters}
          onFilterChange={onFilterChange}
          open={showFilterDrawer}
          onClose={() => setShowFilterDrawer(false)}
        />
      )}
    </>
  );
};

export default StickyHeader;
