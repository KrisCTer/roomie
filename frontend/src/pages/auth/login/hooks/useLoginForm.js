import { useState } from "react";
import { login as loginApi } from "../../../../services/authService";
import { useDialog } from "../../../../contexts/DialogContext";
import { useUser } from "../../../../contexts/UserContext";

const useLoginForm = ({ navigate, t }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useDialog();
  const { refreshUser } = useUser();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const res = await loginApi(form.username, form.password);
      localStorage.setItem("access_token", res.result.token);
      localStorage.setItem("username", form.username);

      // Eagerly populate UserContext from JWT before navigating
      await refreshUser();

      navigate("/home");
    } catch (error) {
      showToast(t("auth.loginError"), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    showPassword,
    setShowPassword,
    loading,
    handleChange,
    handleSubmit,
  };
};

export default useLoginForm;
