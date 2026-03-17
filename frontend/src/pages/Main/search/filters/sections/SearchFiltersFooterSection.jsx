import React from "react";
import { Box, Button } from "@mui/material";

const SearchFiltersFooterSection = ({
  activeFilterCount,
  onReset,
  onApply,
}) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderTop: "1px solid",
        borderColor: "#EEE4D7",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        bgcolor: "#FFFFFF",
      }}
    >
      <Button
        onClick={onReset}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          textDecoration: "underline",
          color: "#374151",
        }}
      >
        Xoa tat ca
      </Button>
      <Button
        onClick={onApply}
        variant="contained"
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1.5,
          textTransform: "none",
          fontWeight: 700,
          bgcolor: "#1F2937",
          boxShadow: "none",
          "&:hover": { bgcolor: "#111827", boxShadow: "none" },
        }}
      >
        {activeFilterCount > 0
          ? `Hien thi ket qua (${activeFilterCount})`
          : "Hien thi ket qua"}
      </Button>
    </Box>
  );
};

export default SearchFiltersFooterSection;
