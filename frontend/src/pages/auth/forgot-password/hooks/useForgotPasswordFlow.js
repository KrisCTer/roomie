import { useState } from "react";
import {
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
} from "../../../../services/authService";

const useForgotPasswordFlow = ({ t }) => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (event) => {
    event.preventDefault();

    if (!email) {
      window.alert(t("auth.fillAll"));
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordApi({ email });
      window.alert(t("auth.otpSent"));
    } catch (error) {
      window.alert(error?.response?.data?.message || t("auth.otpSent"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!token || !newPassword || !confirmPassword) {
      window.alert(t("auth.fillAll"));
      return;
    }

    if (newPassword !== confirmPassword) {
      window.alert(t("auth.passwordNotMatch"));
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({ token, newPassword });
      window.alert(t("auth.passwordChanged"));
    } catch (error) {
      window.alert(error?.response?.data?.message || t("auth.changePassword"));
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};

export default useForgotPasswordFlow;
