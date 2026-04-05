import React, { useState } from "react";
import {
  Camera,
  Shield,
  CheckCircle,
  Edit,
  Upload,
  Mail,
  Phone,
  CreditCard,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const UserProfileHeader = ({ formData, onAvatarUpload, onVerifyIdentity }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const isVerified = onVerifyIdentity;
  const verificationDate = localStorage.getItem("verificationDate");

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* ================= AVATAR ================= */}
        <div className="relative">
          <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 dark:border-dark-primary shadow-xl">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {formData.firstName?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Overlay */}
            <label
              className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarUpload}
                className="hidden"
              />
              <div className="text-center">
                <Camera className="w-8 h-8 text-white mx-auto mb-1" />
                <span className="text-white text-xs font-medium">
                  Change Photo
                </span>
              </div>
            </label>

            {/* Verified Badge */}
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Upload Button (Mobile) */}
          <label className="mt-4 flex md:hidden items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onAvatarUpload}
              className="hidden"
            />
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload Photo</span>
          </label>
        </div>

        {/* ================= USER INFO ================= */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-primary">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`
                  : formData.username || "User"}
              </h2>
              <p className="text-gray-600 dark:text-dark-secondary mt-1">
                @{formData.username || "username"}
              </p>
            </div>

            {/* Edit Profile */}
            <button
              onClick={() =>
                document
                  .getElementById("profile-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
          </div>

          {/* ================= DETAILS GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Email */}
            <InfoItem
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={formData.email}
              color="blue"
            />

            {/* Phone */}
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              label="Phone Number"
              value={formData.phoneNumber}
              color="green"
            />

            {/* ID Card */}
            <InfoItem
              icon={<CreditCard className="w-5 h-5" />}
              label="ID Card Number"
              value={formData.idCardNumber}
              color="teal"
            />

            {/* Gender */}
            <InfoItem
              icon={<User className="w-5 h-5" />}
              label="Gender"
              value={formData.gender}
              color="pink"
            />
          </div>

          {/* ================= VERIFICATION ================= */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield
                  className={`w-5 h-5 ${
                    isVerified
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-primary">
                    Identity Verification
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-tertiary">
                    {isVerified
                      ? `Verified on ${new Date(
                          verificationDate
                        ).toLocaleDateString()}`
                      : "Not verified yet"}
                  </p>
                </div>
              </div>

              {!isVerified && (
                <button
                  onClick={onVerifyIdentity}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENT ================= */
const InfoItem = ({ icon, label, value, color }) => {
  const colorMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    teal:
      "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  };

  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-dark-tertiary">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-dark-primary">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
};

export default UserProfileHeader;

