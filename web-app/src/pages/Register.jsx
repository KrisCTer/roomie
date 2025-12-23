import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
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
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setSnackMsg(t("auth.fillAll"));
      setShowSnack(true);
      return;
    }

    if (password !== confirm) {
      setSnackType("error");
      setSnackMsg(t("auth.passwordNotMatch"));
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
      setSnackMsg(t("auth.registerSuccess"));
      setShowSnack(true);

      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error(err);
      setSnackType("error");
      setSnackMsg(err?.response?.data?.message || t("auth.registerFailed"));
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
          alt={t("auth.register")}
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
            {t("auth.register")}
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            {t("auth.registerSubtitle")}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.2}>
              <TextField
                label={t("auth.username")}
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label={t("auth.firstName")}
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  fullWidth
                />
                <TextField
                  label={t("auth.lastName")}
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  fullWidth
                />
              </Stack>

              <TextField
                label={t("auth.phoneNumber")}
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                fullWidth
              />

              <TextField
                label={t("auth.email")}
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                fullWidth
              />

              <TextField
                type={showPassword ? "text" : "password"}
                label={t("auth.password")}
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

              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label={t("auth.confirmPassword")}
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
                {loading ? t("auth.processing") : t("auth.register")}
              </Button>

              <Typography variant="body2" textAlign="center">
                {t("auth.hasAccount")}{" "}
                <Typography
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{ textDecoration: "none", fontWeight: 500 }}
                >
                  {t("auth.login")}
                </Typography>
              </Typography>
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
        <Alert severity={snackType} onClose={handleCloseSnackBar}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
