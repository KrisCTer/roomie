import { useState } from "react";
import { register as registerApi } from "../../../../services/authService";

const useRegisterForm = ({ navigate, t }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      window.alert(t("auth.fillAll"));
      return;
    }

    if (password !== confirm) {
      window.alert(t("auth.passwordNotMatch"));
      return;
    }

    try {
      setLoading(true);
      await registerApi({ username, email, password, firstName, lastName, phoneNumber });
      window.alert(t("auth.registerSuccess"));
      navigate("/login");
    } catch (error) {
      window.alert(error?.response?.data?.message || t("auth.registerFailed"));
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
