// src/components/FloatingSearchButton.jsx
import { Fab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function FloatingSearchButton() {
  return (
    <Fab
      color="primary"
      aria-label="search"
      sx={{
        position: "fixed",
        bottom: 26,
        right: 26,
        bgcolor: "#ff385c",
        "&:hover": { bgcolor: "#e11d48" },
        boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
        zIndex: 9999,
        width: 58,
        height: 58,
      }}
    >
      <SearchIcon sx={{ fontSize: 28 }} />
    </Fab>
  );
}
