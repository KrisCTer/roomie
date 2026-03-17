import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const SearchFiltersHeaderSection = ({ activeFilterCount, onClose }) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2.25,
        borderBottom: "1px solid",
        borderColor: "#EEE4D7",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1F2937" }}>
          Bo loc
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#7A6D61", fontWeight: 600 }}
        >
          {activeFilterCount > 0
            ? `${activeFilterCount} tieu chi dang ap dung`
            : "Chua ap dung tieu chi"}
        </Typography>
      </Box>
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          border: "1px solid #EADFCC",
          bgcolor: "#FFFFFF",
          "&:hover": { bgcolor: "#FFF7ED" },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default SearchFiltersHeaderSection;
