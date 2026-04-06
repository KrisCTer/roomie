// web-app/src/hooks/useProfileOperations.js
import { useState, useEffect, useCallback } from "react";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  updateIdCard,
  changeMyPassword,
  deleteMyAccount,
} from "../../services/userService";
import { logout as logoutApi } from "../../services/authService";

export const useProfileOperations = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [formData, setFormData] = useState({
    avatarUrl: "",
    username: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    idCardNumber: "",
    permanentAddress: "",
    currentAddress: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  //  Load profile function (useCallback for stable reference)
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();

      const p = res?.result;

      if (!p) {
        console.error("Profile result is empty");
        return;
      }

      setProfile(p);

      setFormData({
        id:  p.userId,
        createdAt: p.createdAt || p.createdDate || p.created_time || "",
        avatarUrl: p.avatar || "",
        username: p.username || "",
        email: p.email || "",
        phoneNumber: p.phoneNumber || "",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        gender: p.gender || "",
        dob: p.dob ? p.dob.substring(0, 10) : "",
        idCardNumber: p.idCardNumber || "",
        permanentAddress: p.permanentAddress || "",
        currentAddress: p.currentAddress || "",
      });
    } catch (err) {
      console.error("Load profile failed:", err);
      setError("Không thể tải thông tin profile. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  //  Refetch profile function (public API)
  const refetchProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  //  Initial load on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitProfile = useCallback(async () => {
    try {
      const payload = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dob: formData.dob,
        idCardNumber: formData.idCardNumber,
        permanentAddress: formData.permanentAddress,
        currentAddress: formData.currentAddress,
      };

      await updateMyProfile(payload);
      setSuccess("Cập nhật thông tin thành công!");
      await loadProfile();
    } catch (e) {
      console.error(e);
      setError("Không thể cập nhật thông tin.");
    }
  }, [formData, loadProfile]);

  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadAvatar(file);

      const newAvatarUrl = res?.result?.avatar;
      const updatedUrl = `${newAvatarUrl}?v=${Date.now()}`;

      setFormData((prev) => ({
        ...prev,
        avatarUrl: updatedUrl,
      }));

      setProfile((prev) => ({ ...prev, avatar: updatedUrl }));

      await loadProfile();
      setSuccess(" Upload avatar thành công!");
    } catch (err) {
      console.error("Upload avatar failed:", err);
      setError("Không thể upload avatar. Vui lòng thử lại.");
    }
  }, [loadProfile]);

  const handleIdCardUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      const res = await updateIdCard(file);


      // Chuẩn hóa đọc response
      const result = res?.data?.result || res?.result;

      if (!result) {
        throw new Error("Phản hồi không hợp lệ từ server.");
      }

      // Cập nhật formData từ QR
      setFormData((prev) => ({
        ...prev,
        username: result.username ?? prev.username,
        firstName: result.firstName ?? prev.firstName,
        lastName: result.lastName ?? prev.lastName,
        idCardNumber: result.idCardNumber ?? prev.idCardNumber,
        dob: result.dob ? result.dob.substring(0, 10) : prev.dob,
        gender:
          result.gender === "MALE"
            ? "Nam"
            : result.gender === "FEMALE"
            ? "Nữ"
            : prev.gender,
        permanentAddress: result.permanentAddress ?? prev.permanentAddress,
        currentAddress: result.currentAddress ?? prev.currentAddress,
        email: result.email ?? prev.email,
        phoneNumber: result.phoneNumber ?? prev.phoneNumber,
      }));

      setSuccess(" Quét CCCD thành công! Thông tin đã được tự động điền.");
    } catch (err) {
      console.error("❌ Upload ID Card Error:", err);

      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xử lý ảnh CCCD. Vui lòng thử lại.";

      setError("❌ " + errorMsg);
    }
  }, []);

  const handleIdCardFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    await handleIdCardUpload(file);
  }, [handleIdCardUpload]);

  const handlePasswordUpdate = useCallback(async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Mật khẩu mới không trùng khớp!");
      return;
    }

    if (!passwords.oldPassword || !passwords.newPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.");
      return;
    }

    try {
      setUpdatingPassword(true);
      setError(null);
      setSuccess(null);

      await changeMyPassword({
        username: formData.username,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      setSuccess("Đổi mật khẩu thành công!");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu cũ.",
      );
    } finally {
      setUpdatingPassword(false);
    }
  }, [passwords, formData.username]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      setDeletingAccount(true);
      setError(null);
      setSuccess(null);

      await deleteMyAccount();
      await logoutApi();
      setSuccess("Tài khoản đã được xóa thành công.");
      return true;
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          "Không thể xóa tài khoản. Vui lòng thử lại sau.",
      );
      return false;
    } finally {
      setDeletingAccount(false);
    }
  }, []);

  const handleOpenCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const handleCameraCapture = useCallback(async (file) => {
    await handleIdCardUpload(file);
  }, [handleIdCardUpload]);

  return {
    // State
    loading,
    profile,
    formData,
    passwords,
    showCamera,
    error,
    success,
    updatingPassword,
    deletingAccount,
    setError,
    setSuccess,

    // Handlers
    handleInputChange,
    handlePasswordChange,
    handleSubmitProfile,
    handleAvatarUpload,
    handleIdCardFileSelect,
    handlePasswordUpdate,
    handleDeleteAccount,
    handleOpenCamera,
    handleCloseCamera,
    handleCameraCapture,

    //  Refetch
    refetchProfile,
    loadProfile,
  };
};