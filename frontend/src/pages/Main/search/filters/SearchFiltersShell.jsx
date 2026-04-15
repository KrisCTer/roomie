import React from "react";
import { Box, Drawer } from "@mui/material";
import "../../../../styles/apple-glass-dashboard.css";
import useSearchFiltersState from "./hooks/useSearchFiltersState";
import SearchFiltersHeaderSection from "./sections/SearchFiltersHeaderSection";
import SearchFiltersContentSection from "./sections/SearchFiltersContentSection";
import SearchFiltersFooterSection from "./sections/SearchFiltersFooterSection";

const SearchFiltersShell = ({ filters, onFilterChange, open, onClose }) => {
  const {
    localFilters,
    setLocalFilters,
    activeFilterCount,
    handleApply,
    handleReset,
  } = useSearchFiltersState({ filters, open, onFilterChange, onClose });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          borderRadius: { xs: 0, sm: "20px 0 0 20px" },
          background: "linear-gradient(145deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.52) 50%, rgba(255,250,245,0.6) 100%)",
          backdropFilter: "blur(48px) saturate(200%)",
          WebkitBackdropFilter: "blur(48px) saturate(200%)",
          border: "none",
          borderLeft: "0.5px solid rgba(255,255,255,0.55)",
          boxShadow: "0 24px 48px rgba(35,32,28,0.12), 0 8px 16px rgba(35,32,28,0.06), inset 0 1px 0 rgba(255,255,255,0.65)",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <SearchFiltersHeaderSection
          activeFilterCount={activeFilterCount}
          onClose={onClose}
        />
        <SearchFiltersContentSection
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          activeFilterCount={activeFilterCount}
        />
        <SearchFiltersFooterSection
          activeFilterCount={activeFilterCount}
          onReset={handleReset}
          onApply={handleApply}
        />
      </Box>
    </Drawer>
  );
};

export default SearchFiltersShell;
