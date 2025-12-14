import { useState, useEffect } from "react";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  updateIdCard,
} from "../services/user.service";

export const useProfileOperations = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getMyProfile();
      console.log("PROFILE RESPONSE =", res);

      const p = res?.result;

      if (!p) {
        console.error("Profile result is empty");
        return;
      }

      setProfile(p);

      setFormData({
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

      setLoading(false);
    } catch (err) {
    console.error("Upload avatar failed:", err);
    setError("Không thể upload avatar. Vui lòng thử lại.");
  }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async () => {
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
      loadProfile();
    } catch (e) {
      console.error(e);
      setError("Không thể cập nhật thông tin.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadAvatar(file);
      console.log("UPLOAD AVATAR RESPONSE", res);

      const newAvatarUrl = res?.result?.avatar;
      const updatedUrl = `${newAvatarUrl}?v=${Date.now()}`;

      setFormData((prev) => ({
        ...prev,
        avatarUrl: updatedUrl,
      }));

      setProfile((prev) => ({ ...prev, avatar: updatedUrl }));

      await loadProfile();
    } catch (err) {
      console.error("Upload avatar failed:", err);
    }
  };

  const handleIdCardUpload = async (file) => {
  if (!file) return;

  try {
    const res = await updateIdCard(file);

    console.log("ID CARD UPLOAD RESPONSE =", res);

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

    setSuccess("✅ Quét CCCD thành công! Thông tin đã được tự động điền.");
  } catch (err) {
    console.error("❌ Upload ID Card Error:", err);

    const errorMsg =
      err?.response?.data?.message ||
      err?.message ||
      "Không thể xử lý ảnh CCCD. Vui lòng thử lại.";

    setError("❌ " + errorMsg);
  }
};


  const handleIdCardFileSelect = async (e) => {
    const file = e.target.files?.[0];
    await handleIdCardUpload(file);
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Mật khẩu mới không trùng khớp!");
      return;
    }

    try {
      // await changePassword({
      //   oldPassword: passwords.oldPassword,
      //   newPassword: passwords.newPassword,
      // });

      setSuccess("Password updated successfully!");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      console.error(e);
      setError("Không thể đổi mật khẩu.");
    }
  };

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const handleCameraCapture = async (file) => {
    await handleIdCardUpload(file);
  };

  return {
    // State
    loading,
    profile,
    formData,
    passwords,
    showCamera,

    error,
    success,
    setError,
    setSuccess,

    // Handlers
    handleInputChange,
    handlePasswordChange,
    handleSubmitProfile,
    handleAvatarUpload,
    handleIdCardFileSelect,
    handlePasswordUpdate,
    handleOpenCamera,
    handleCloseCamera,
    handleCameraCapture,
  };
};