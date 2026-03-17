import React from "react";
import { Box, Drawer } from "@mui/material";
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
          bgcolor: "#FFFCF8",
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
