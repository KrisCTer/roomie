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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../services/auth.service"; // ⭐ THÊM
import { useTranslation } from "react-i18next";

export default function Login() {
  const navigate = useNavigate();

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
      await loginApi(form.username, form.password); // ⭐ GỌI API LOGIN
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      alert(err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
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
            Login
          </Typography>

          <Typography color="text.secondary" fontSize={14} mb={4}>
            Welcome back! Please enter your account to continue.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              Account
            </Typography>
            <TextField
              fullWidth
              placeholder="admin@gmail.com"
              name="username"
              value={form.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            {/* PASSWORD */}
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              Password
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
              <Link
                underline="hover"
                color="primary"
                sx={{ cursor: "pointer", fontSize: 14 }}
              >
                Forgot password
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
              Login
            </Button>

            {/* REGISTER LINK */}
            <Typography textAlign="center" fontSize={14} mb={1}>
              Don’t you have an account?{" "}
              <Link
                underline="hover"
                sx={{ cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                Register
              </Link>
            </Typography>

            {/* GUEST VIEW */}
            <Typography textAlign="center" fontSize={14} mt={2}>
              <Link
                underline="hover"
                sx={{ cursor: "pointer", fontWeight: 600 }}
                onClick={() => navigate("/home")}
              >
                Xem mà không cần đăng nhập
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
