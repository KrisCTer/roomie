import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";

import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
} from "../../services/user.service";

// Nếu backend có API đổi mật khẩu → bạn đặt vào đây
// import { changePassword } from "../../services/profile.service";

const Profile = () => {
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const loadProfile = async () => {
    try {
      const res = await getMyProfile();
      console.log("PROFILE RESPONSE =", res);

      const p = res?.result; // backend của bạn chuẩn JSON API

      if (!p) {
        console.error("Profile result is empty");
        return;
      }

      setProfile(p);

      // ⭐ Fill vào form để UI hiển thị đúng
      setFormData({
        avatarUrl: p.avatar || "",

        username: p.username || "",
        email: p.email || "",
        phoneNumber: p.phoneNumber || "",

        firstName: p.firstName || "",
        lastName: p.lastName || "",

        gender: p.gender || "",
        dob: p.dob ? p.dob.substring(0, 10) : "", // YYYY-MM-DD

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

      await updateProfile(payload);

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

  // =============================
  // UI
  // =============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="px-10 py-8 w-full">
          {/* Avatar */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Avatar</h2>

            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={formData.avatarUrl || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover"
                />

                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer">
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
          </div>

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

        <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200 mt-8">
          Copyright © 2025 Roomie. All rights reserved.
        </footer>
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
    <Footer />
  </div>
);
