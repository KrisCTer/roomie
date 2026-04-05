import { useState } from "react";
import {
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
} from "../../../../services/authService";
import { useDialog } from "../../../../contexts/DialogContext";

const useForgotPasswordFlow = ({ t }) => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useDialog();

  const handleRequestReset = async (event) => {
    event.preventDefault();

    if (!email) {
      showToast(t("auth.fillAll"), "warning");
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordApi({ email });
      showToast(t("auth.otpSent"), "success");
    } catch (error) {
      showToast(error?.response?.data?.message || t("auth.otpSent"), "info");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!token || !newPassword || !confirmPassword) {
      showToast(t("auth.fillAll"), "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(t("auth.passwordNotMatch"), "warning");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({ token, newPassword });
      showToast(t("auth.passwordChanged"), "success");
    } catch (error) {
      showToast(error?.response?.data?.message || t("auth.changePassword"), "error");
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
