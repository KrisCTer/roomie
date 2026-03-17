import React from "react";
import { Box } from "@mui/material";
import EditorialHeader from "../../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../../components/layout/layoutHome/EditorialFooter";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

const PropertyDetailLoadingSection = () => {
  return (
    <div className="home-v2 min-h-screen bg-[var(--home-bg)]">
      <EditorialHeader />
      <Box
        sx={{
          minHeight: "64vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpinner />
      </Box>
      <EditorialFooter description="Đang tải chi tiết bất động sản..." />
    </div>
  );
};

export default PropertyDetailLoadingSection;
