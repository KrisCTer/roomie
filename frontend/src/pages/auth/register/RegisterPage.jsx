import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useRegisterForm from "./hooks/useRegisterForm";
import RegisterCardSection from "./sections/RegisterCardSection";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    form,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    handleChange,
    handleSubmit,
  } = useRegisterForm({ navigate, t });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 15%, #FFEFD8 0%, #FFF7ED 35%, #F8FAFC 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <RegisterCardSection
        t={t}
        form={form}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default RegisterPage;
