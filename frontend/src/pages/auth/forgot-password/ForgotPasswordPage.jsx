import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import ForgotPasswordSection from "./sections/ForgotPasswordSection";
import useForgotPasswordFlow from "./hooks/useForgotPasswordFlow";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    token,
    setToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleRequestReset,
    handleResetPassword,
  } = useForgotPasswordFlow({ t });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 25% 15%, #FFF2E2 0%, #FFF8F1 30%, #F8FAFC 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <ForgotPasswordSection
        t={t}
        email={email}
        setEmail={setEmail}
        token={token}
        setToken={setToken}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        loading={loading}
        onRequestReset={handleRequestReset}
        onResetPassword={handleResetPassword}
      />
    </Box>
  );
};

export default ForgotPasswordPage;
