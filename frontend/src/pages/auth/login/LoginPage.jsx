import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginCardSection from "./sections/LoginCardSection";
import useLoginForm from "./hooks/useLoginForm";

const BACKEND_URL = "http://localhost:8080/identity";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    form,
    showPassword,
    setShowPassword,
    loading,
    handleChange,
    handleSubmit,
  } = useLoginForm({ navigate, t });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 12% 20%, #FFEFD8 0%, #FFF7ED 30%, #F8FAFC 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <LoginCardSection
        t={t}
        form={form}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onForgotPassword={() => navigate("/forgot-password")}
        onNavigateRegister={() => navigate("/register")}
        onNavigateHome={() => navigate("/home")}
        onGoogleLogin={() => {
          window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
        }}
        onFacebookLogin={() => {
          window.location.href = `${BACKEND_URL}/oauth2/authorization/facebook`;
        }}
      />
    </Box>
  );
};

export default LoginPage;
