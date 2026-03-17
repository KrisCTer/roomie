import React from "react";
import { Chip, Stack, Typography } from "@mui/material";

const PropertyDetailMetaSection = ({ property }) => {
  return (
    <section className="mb-4 rounded-2xl border border-[#ECDCC8] bg-white/95 p-4">
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600 }}>
          Chi tiết bất động sản
        </Typography>
        {property?.address?.province && (
          <Chip
            size="small"
            label={property.address.province}
            sx={{ bgcolor: "#FFF4E8", color: "#B45309", fontWeight: 700 }}
          />
        )}
      </Stack>
    </section>
  );
};

export default PropertyDetailMetaSection;
