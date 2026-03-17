import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";

const LoginCardSection = ({
  t,
  form,
  showPassword,
  setShowPassword,
  loading,
  onChange,
  onSubmit,
  onForgotPassword,
  onNavigateRegister,
  onNavigateHome,
  onGoogleLogin,
  onFacebookLogin,
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        width: "900px",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid #F0E7DB",
        boxShadow: "0 30px 70px rgba(15, 23, 42, 0.12)",
      }}
    >
      <Box
        sx={{
          width: "50%",
          backgroundImage: "url('/images/login-roomie.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: { xs: "none", md: "block" },
        }}
      />

      <CardContent
        sx={{
          width: { xs: "100%", md: "50%" },
          p: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "rgba(255,255,255,0.94)",
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1} color="#111827">
          {t("auth.login")}
        </Typography>
        <Typography color="#6B7280" fontSize={14} mb={4}>
          {t("auth.loginSubtitle")}
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <Typography fontWeight={600} fontSize={14} mb={0.5}>
            {t("auth.username")}
          </Typography>
          <TextField
            fullWidth
            placeholder={t("auth.usernamePlaceholder")}
            name="username"
            value={form.username}
            onChange={onChange}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
              },
            }}
          />

          <Typography fontWeight={600} fontSize={14} mb={0.5}>
            {t("auth.password")}
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            name="password"
            value={form.password}
            onChange={onChange}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box textAlign="right" mb={3}>
            <Link
              component="button"
              type="button"
              underline="hover"
              color="#DD6B20"
              sx={{ fontSize: 14, fontWeight: 600 }}
              onClick={onForgotPassword}
            >
              {t("auth.forgotPassword")}
            </Link>
          </Box>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              background: "#111827",
              height: 48,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
              mb: 2,
              boxShadow: "none",
              "&:hover": { background: "#030712", boxShadow: "none" },
            }}
          >
            {loading ? t("auth.processing") : t("auth.login")}
          </Button>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              {t("auth.orLoginWith")}
            </Typography>
          </Divider>

          <Stack direction="row" spacing={2} mb={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={onGoogleLogin}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={onFacebookLogin}
            >
              Facebook
            </Button>
          </Stack>

          <Typography textAlign="center" fontSize={14} mb={1}>
            {t("auth.noAccount")}{" "}
            <Link
              underline="hover"
              sx={{ cursor: "pointer" }}
              onClick={onNavigateRegister}
            >
              {t("auth.register")}
            </Link>
          </Typography>
          <Typography textAlign="center" fontSize={14} mt={2}>
            <Link
              underline="hover"
              sx={{ cursor: "pointer", fontWeight: 600 }}
              onClick={onNavigateHome}
            >
              {t("auth.viewWithoutLogin")}
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginCardSection;
