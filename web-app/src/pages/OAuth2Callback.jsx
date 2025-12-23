import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { setToken } from "../services/localStorageService";

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(">>> OAuth2Callback mounted");
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth2 error:", error);
      alert("Login failed: " + error);
      navigate("/login");
      return;
    }

    if (token) {
      // Save token and user info
      setToken(token);
      localStorage.setItem("username", email);
      localStorage.setItem("userEmail", email);

      // Redirect to home
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } else {
      console.error("Missing token or email");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0b1b2a",
        color: "white",
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" fontWeight={600}>
        Processing your login...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Please wait while we complete your authentication
      </Typography>
    </Box>
  );
}
