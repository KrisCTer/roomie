import { useState } from "react";
import { register as registerApi } from "../../../../services/authService";
import { useDialog } from "../../../../contexts/DialogContext";

const useRegisterForm = ({ navigate, t }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useDialog();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, email, password, confirm, firstName, lastName, phoneNumber } = form;

    if (!username || !email || !password || !firstName || !lastName || !phoneNumber) {
      showToast(t("auth.fillAll"), "warning");
      return;
    }

    if (password !== confirm) {
      showToast(t("auth.passwordNotMatch"), "warning");
      return;
    }

    try {
      setLoading(true);
      await registerApi({ username, email, password, firstName, lastName, phoneNumber });
      showToast(t("auth.registerSuccess"), "success");
      navigate("/login");
    } catch (error) {
      showToast(error?.response?.data?.message || t("auth.registerFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    handleChange,
    handleSubmit,
  };
};

export default useRegisterForm;
