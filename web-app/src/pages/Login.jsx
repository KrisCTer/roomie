import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  Divider,
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../services/auth.service";
import { useTranslation } from "react-i18next";

const BACKEND_URL = "http://localhost:8080/identity";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginApi(form.username, form.password);

      localStorage.setItem("access_token", res.result.token);
      localStorage.setItem("username", form.username);

      // Không redirect admin nữa – tất cả vào Home
      navigate("/home");
    } catch (err) {
      alert(t("auth.loginError"));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/facebook`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0b1b2a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          display: "flex",
          width: "900px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
        }}
      >
        {/* LEFT IMAGE */}
        <Box
          sx={{
            width: "50%",
            backgroundImage:
              "url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></Box>

        {/* RIGHT FORM */}
        <CardContent
          sx={{
            width: "50%",
            p: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={1}>
            {t("auth.login")}
          </Typography>

          <Typography color="text.secondary" fontSize={14} mb={4}>
            {t("auth.loginSubtitle")}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              {t("auth.username")}
            </Typography>
            <TextField
              fullWidth
              placeholder={t("auth.usernamePlaceholder")}
              name="username"
              value={form.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            {/* PASSWORD */}
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              {t("auth.password")}
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              name="password"
              value={form.password}
              onChange={handleChange}
              sx={{ mb: 1 }}
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

            {/* FORGOT PASSWORD */}
            <Box textAlign="right" mb={3}>
              <Link underline="hover" color="primary" sx={{ fontSize: 14 }}>
                {t("auth.forgotPassword")}
              </Link>
            </Box>

            {/* LOGIN BUTTON */}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{
                background: "#2563eb",
                height: 48,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                mb: 2,
              }}
            >
              {t("auth.login")}
            </Button>

            {/* DIVIDER */}
            <Divider sx={{ my: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t("auth.orLoginWith")}
              </Typography>
            </Divider>

            {/* SOCIAL LOGIN BUTTONS */}
            <Stack direction="row" spacing={2} mb={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  height: 48,
                  borderColor: "#e0e0e0",
                  color: "#424242",
                  "&:hover": {
                    borderColor: "#2563eb",
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={handleFacebookLogin}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  height: 48,
                  borderColor: "#e0e0e0",
                  color: "#424242",
                  "&:hover": {
                    borderColor: "#1877f2",
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                Facebook
              </Button>
            </Stack>

            {/* REGISTER LINK */}
            <Typography textAlign="center" fontSize={14} mb={1}>
              {t("auth.noAccount")}{" "}
              <Link
                underline="hover"
                sx={{ cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                {t("auth.register")}
              </Link>
            </Typography>

            {/* GUEST VIEW */}
            <Typography textAlign="center" fontSize={14} mt={2}>
              <Link
                underline="hover"
                sx={{ cursor: "pointer", fontWeight: 600 }}
                onClick={() => navigate("/home")}
              >
                {t("auth.viewWithoutLogin")}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
