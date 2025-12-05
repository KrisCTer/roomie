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
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { register as registerApi } from "../services/auth.service";
import { useTranslation } from "react-i18next";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // FORM STATES
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [showSnack, setShowSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackType, setSnackType] = useState("success");
  const [loading, setLoading] = useState(false);

  const handleCloseSnackBar = (_, reason) => {
    if (reason === "clickaway") return;
    setShowSnack(false);
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      username,
      email,
      password,
      confirm,
      firstName,
      lastName,
      phoneNumber,
    } = form;

    if (
      !username ||
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phoneNumber
    ) {
      setSnackType("error");
      setSnackMsg("Please fill all required fields!");
      setShowSnack(true);
      return;
    }

    if (password !== confirm) {
      setSnackType("error");
      setSnackMsg("Passwords do not match");
      setShowSnack(true);
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        username,
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      });

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
        {/* Left Image */}
        <CardMedia
          component="img"
          image="/images/login-livingroom.jpg"
          alt="Register"
          sx={{
            width: { xs: "100%", md: "50%" },
            height: { xs: 240, md: "auto" },
            objectFit: "cover",
          }}
        />

        {/* Form Section */}
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
              {/* Username */}
              <TextField
                label="Username"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                fullWidth
              />

              {/* First + Last Name */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  fullWidth
                />
              </Stack>

              {/* Phone Number */}
              <TextField
                label="Phone Number"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                fullWidth
              />

              {/* Email */}
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                fullWidth
              />

              {/* Password */}
              <TextField
                type={showPassword ? "text" : "password"}
                label="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ minWidth: "40px" }}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  ),
                }}
              />
              {/* Confirm Password */}
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                value={form.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      sx={{ minWidth: "40px" }}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
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
                <Button variant="outlined" sx={{ borderRadius: 999, px: 3 }}>
                  Google
                </Button>
                <Button variant="outlined" sx={{ borderRadius: 999, px: 3 }}>
                  Facebook
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={showSnack}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackType} onClose={handleCloseSnackBar}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
