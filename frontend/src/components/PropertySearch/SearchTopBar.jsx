// src/components/PropertySearch/SearchTopBar.jsx
import React, { useState } from "react";
import { Box, Container, IconButton, Button, Paper } from "@mui/material";
import { FilterList as FilterIcon } from "@mui/icons-material";
import SearchBar from "../layout/layoutHome/SearchBar";

const SearchTopBar = ({ onFilterClick, filterCount }) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 56, md: 64 }, // Below main header
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "grey.200",
        zIndex: 40,
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Search Bar - compact mode */}
          <Box sx={{ flex: 1, maxWidth: 800 }}>
            <SearchBar compact />
          </Box>

          {/* Filter Button */}
          <Button
            onClick={onFilterClick}
            startIcon={<FilterIcon />}
            variant="outlined"
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1.5,
              borderWidth: 2,
              borderColor: "grey.300",
              color: "grey.900",
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": {
                borderWidth: 2,
                borderColor: "grey.900",
                bgcolor: "grey.50",
              },
              position: "relative",
            }}
          >
            <span>Bộ lọc</span>
            {filterCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  bgcolor: "error.main",
                  color: "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {filterCount}
              </Box>
            )}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchTopBar;
