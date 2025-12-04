import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { register as registerApi } from "../services/auth.service";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showSnack, setShowSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackType, setSnackType] = useState("success");
  const [loading, setLoading] = useState(false);

  const handleCloseSnackBar = (_, reason) => {
    if (reason === "clickaway") return;
    setShowSnack(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setSnackType("error");
      setSnackMsg("Please fill all fields");
      setShowSnack(true);
      return;
    }

    if (password !== confirm) {
      setSnackType("error");
      setSnackMsg("Password and confirm password do not match");
      setShowSnack(true);
      return;
    }

    setLoading(true);
    try {
      await registerApi({ username, email, password });
      setSnackType("success");
      setSnackMsg("Register successfully. Please login.");
      setShowSnack(true);
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error(err);
      setSnackType("error");
      setSnackMsg(
        err?.response?.data?.message ||
          "Register failed. Please check your information."
      );
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0b1b2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 1000,
          borderRadius: 4,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Ảnh bên trái – dùng cùng ảnh với login hoặc 1 ảnh khác trong /public/images */}
        <CardMedia
          component="img"
          image="/images/login-livingroom.jpg" // đổi nếu bạn muốn ảnh khác
          alt="Register"
          sx={{
            width: { xs: "100%", md: "50%" },
            height: { xs: 240, md: "auto" },
            objectFit: "cover",
          }}
        />

        {/* Form bên phải */}
        <CardContent
          sx={{
            width: { xs: "100%", md: "50%" },
            p: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" fontWeight={600} mb={1}>
            Register
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create an account to start exploring properties.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.2}>
              <TextField
                size="medium"
                label="User name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
              <TextField
                size="medium"
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                size="medium"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <TextField
                size="medium"
                type="password"
                label="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  py: 1.2,
                  fontWeight: 600,
                }}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>

              <Typography variant="body2" textAlign="center">
                Already have an account?{" "}
                <Typography
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{ textDecoration: "none", fontWeight: 500 }}
                >
                  Login
                </Typography>
              </Typography>

              <Divider>or sign up with</Divider>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 999, px: 3 }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 999, px: 3 }}
                >
                  Facebook
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={showSnack}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackType}
          onClose={handleCloseSnackBar}
          sx={{ width: "100%" }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
