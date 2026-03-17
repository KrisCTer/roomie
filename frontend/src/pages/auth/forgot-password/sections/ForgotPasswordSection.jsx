import React from "react";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const ForgotPasswordSection = ({
  t,
  email,
  setEmail,
  token,
  setToken,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onRequestReset,
  onResetPassword,
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 600,
        borderRadius: 5,
        border: "1px solid #F0E7DB",
        boxShadow: "0 24px 56px rgba(15, 23, 42, 0.12)",
        p: { xs: 3, md: 4 },
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={1} color="#111827">
        {t("auth.forgotPassword")}
      </Typography>
      <Typography variant="body2" color="#6B7280" mb={3}>
        {t("auth.forgotSubtitle")}
      </Typography>

      <Stack spacing={3}>
        <Box component="form" onSubmit={onRequestReset}>
          <Stack spacing={2}>
            <TextField
              type="email"
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                py: 1.2,
                fontWeight: 700,
                bgcolor: "#111827",
              }}
            >
              {loading ? t("auth.processing") : t("auth.sendOtp")}
            </Button>
          </Stack>
        </Box>

        <Box component="form" onSubmit={onResetPassword}>
          <Stack spacing={2}>
            <TextField
              label={t("auth.otp") || "OTP / Token"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label={t("auth.newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label={t("auth.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                py: 1.2,
                fontWeight: 700,
                borderColor: "#111827",
                color: "#111827",
              }}
            >
              {loading ? t("auth.processing") : t("auth.changePassword")}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" textAlign="center">
          <Typography
            component={RouterLink}
            to="/login"
            color="#DD6B20"
            sx={{ textDecoration: "none", fontWeight: 700 }}
          >
            {t("auth.backToLogin") || t("auth.login")}
          </Typography>
        </Typography>
      </Stack>
    </Card>
  );
};

export default ForgotPasswordSection;
