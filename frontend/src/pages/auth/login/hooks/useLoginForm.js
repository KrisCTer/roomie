import { useState } from "react";
import { login as loginApi } from "../../../../services/authService";
import { useDialog } from "../../../../contexts/DialogContext";

const useLoginForm = ({ navigate, t }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useDialog();

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
      const user = res?.result?.user ?? res?.user;
      const role = (user?.role || "").toLowerCase();
      const isAdmin =
        role === "admin" || form.username.toLowerCase() === "admin";

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
