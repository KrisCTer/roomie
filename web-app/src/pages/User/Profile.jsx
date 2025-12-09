import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Camera, Upload, X } from "lucide-react";

import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx"; // <-- THÊM DÒNG NÀY
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  updateIdCard,
} from "../../services/user.service";

const Profile = () => {
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

  // =============================
  // LOAD PROFILE
  // =============================
  useEffect(() => {
    loadProfile();
  }, []);

  // Cleanup camera stream khi component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
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
      console.error("Failed to load profile:", err);
      setLoading(false);
    }
  };

  // =============================
  // HANDLERS
  // =============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // =============================
  // UPDATE PROFILE
  // =============================
  const handleSubmit = async () => {
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

      alert("Cập nhật thông tin thành công!");
      loadProfile();
    } catch (e) {
      console.error(e);
      alert("Không thể cập nhật thông tin.");
    }
  };

  // =============================
  // UPDATE AVATAR
  // =============================
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

  // =============================
  // ID CARD UPLOAD
  // =============================
  const handleIdCardUpload = async (file) => {
    if (!file) return;

    try {
      const res = await updateIdCard(file);
      console.log("ID CARD UPLOAD RESPONSE", res);

      const result = res?.result;
      if (result) {
        setFormData((prev) => ({
          ...prev,
          username: result.username || prev.username,
          firstName: result.firstName || prev.firstName,
          lastName: result.lastName || prev.lastName,
          idCardNumber: result.idCardNumber || prev.idCardNumber,
          dob: result.dob ? result.dob.substring(0, 10) : prev.dob,
          gender:
            result.gender === "MALE"
              ? "Nam"
              : result.gender === "FEMALE"
              ? "Nữ"
              : prev.gender,
          permanentAddress: result.permanentAddress || prev.permanentAddress,
          currentAddress: result.currentAddress || prev.currentAddress,
          email: result.email || prev.email,
          phoneNumber: result.phoneNumber || prev.phoneNumber,
        }));

        alert(
          "✅ Quét CCCD/CMND thành công! Thông tin đã được tự động điền. Vui lòng kiểm tra và cập nhật nếu cần."
        );
      }
    } catch (err) {
      console.error("ID Card upload failed:", err);
      const errorMsg =
        err?.response?.data?.message ||
        "Không thể xử lý ảnh CCCD/CMND. Vui lòng thử lại.";
      alert("❌ " + errorMsg);
    }
  };

  const handleIdCardFileSelect = async (e) => {
    const file = e.target.files?.[0];
    await handleIdCardUpload(file);
  };

  // =============================
  // CAMERA FUNCTIONS
  // =============================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setShowCamera(true);
    } catch (err) {
      console.error("Failed to start camera:", err);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "id-card.jpg", { type: "image/jpeg" });
        stopCamera();
        await handleIdCardUpload(file);
      }
    }, "image/jpeg");
  };

  // =============================
  // CHANGE PASSWORD
  // =============================
  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Mật khẩu mới không trùng khớp!");
      return;
    }

    try {
      // await changePassword({
      //   oldPassword: passwords.oldPassword,
      //   newPassword: passwords.newPassword,
      // });

      alert("Password updated successfully!");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      console.error(e);
      alert("Không thể đổi mật khẩu.");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center mt-20 text-xl">
        Loading profile...
      </div>
    );

  // XÁC ĐỊNH CÓ PHẢI ADMIN KHÔNG (DÙNG username từ profile)
  const isAdmin = formData.username?.toLowerCase() === "admin";

  // =============================
  // UI
  // =============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      {isAdmin ? (
        <AdminSidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
        />
      ) : (
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
        />
      )}

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="px-10 py-8 w-full">
          {/* Avatar & ID Card Scanner */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Avatar & ID Card Scanner</h2>

            <div className="flex items-start gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-3">Profile Picture</p>
                <div className="relative">
                  <img
                    src={formData.avatarUrl || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-32 h-32 rounded-xl object-cover"
                  />

                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer shadow-lg">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
              </div>

              {/* ID Card Scanner Section */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Scan ID Card (CCCD/CMND) to auto-fill information
                </p>
                <div className="flex flex-col gap-3">
                  {/* Upload Button */}
                  <label className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition shadow-md">
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Upload ID Card Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleIdCardFileSelect}
                    />
                  </label>

                  {/* Camera Button */}
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="font-medium">Open Camera to Scan</span>
                  </button>

                  <p className="text-xs text-gray-500 mt-2">
                    📷 Hỗ trợ quét QR code và OCR để tự động điền thông tin từ
                    CCCD/CMND
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Scan ID Card</h3>
                  <button
                    onClick={stopCamera}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    📸 Capture & Scan
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORM */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Information</h2>

            <div className="space-y-6">
              <Field
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <Field
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Field
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                />
                <Field
                  label="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>

              <Field
                label="ID Card Number"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleInputChange}
              />
              <Field
                label="Permanent Address"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
              />
              <Field
                label="Current Address"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Save & Update
            </button>
          </div>

          {/* PASSWORD */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Change Password</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PasswordField
                label="Old Password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                show={showOldPassword}
                toggle={() => setShowOldPassword(!showOldPassword)}
              />

              <PasswordField
                label="New Password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                show={showNewPassword}
                toggle={() => setShowNewPassword(!showNewPassword)}
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                show={showConfirmPassword}
                toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            <button
              onClick={handlePasswordUpdate}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Update Password
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Profile;

// ============================
// REUSABLE COMPONENTS
// ============================
const Field = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, toggle }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);
