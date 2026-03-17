import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const RegisterCardSection = ({
  t,
  form,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  onChange,
  onSubmit,
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 1000,
        borderRadius: 5,
        border: "1px solid #F0E7DB",
        boxShadow: "0 30px 70px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <CardMedia
        component="img"
        image="/images/register-roomie.jpg"
        alt={t("auth.register")}
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: 240, md: "auto" },
          objectFit: "cover",
          display: { xs: "none", md: "block" },
        }}
      />

      <CardContent
        sx={{
          width: { xs: "100%", md: "50%" },
          p: { xs: 3, md: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "rgba(255,255,255,0.94)",
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1} color="#111827">
          {t("auth.register")}
        </Typography>
        <Typography variant="body2" color="#6B7280" mb={3}>
          {t("auth.registerSubtitle")}
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            <TextField
              label={t("auth.username")}
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label={t("auth.firstName")}
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                fullWidth
              />
              <TextField
                label={t("auth.lastName")}
                value={form.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              label={t("auth.phoneNumber")}
              value={form.phoneNumber}
              onChange={(e) => onChange("phoneNumber", e.target.value)}
              fullWidth
            />
            <TextField
              label={t("auth.email")}
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              fullWidth
            />
            <TextField
              type={showPassword ? "text" : "password"}
              label={t("auth.password")}
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: "40px" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                ),
              }}
            />
            <TextField
              type={showConfirmPassword ? "text" : "password"}
              label={t("auth.confirmPassword")}
              value={form.confirm}
              onChange={(e) => onChange("confirm", e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    sx={{ minWidth: "40px" }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
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
                borderRadius: 3,
                py: 1.35,
                fontWeight: 700,
                bgcolor: "#111827",
              }}
            >
              {loading ? t("auth.processing") : t("auth.register")}
            </Button>

            <Typography variant="body2" textAlign="center">
              {t("auth.hasAccount")}{" "}
              <Typography
                component={RouterLink}
                to="/login"
                color="#DD6B20"
                sx={{ textDecoration: "none", fontWeight: 700 }}
              >
                {t("auth.login")}
              </Typography>
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RegisterCardSection;
