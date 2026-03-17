/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
// web-app/src/pages/Profile/Profile.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx";
import { useTranslation } from "react-i18next";
import { useRefresh } from "../../contexts/RefreshContext";
import {
  User,
  Settings,
  Edit3,
  Camera,
  CheckCircle,
  Mail,
  Eye,
} from "lucide-react";

// Import custom components
import ProfileOverview from "../../components/Profile/ProfileOverview.jsx";
import EditProfileForm from "../../components/Profile/EditProfileForm.jsx";
import AccountSettings from "../../components/Profile/AccountSettings.jsx";
import ProfileSkeleton from "../../components/Profile/ProfileSkeleton.jsx";

// Import custom hook
import { useProfileOperations } from "../../hooks/useProfileOperations.js";

const Profile = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useTranslation();

  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

  const {
    loading,
    formData,
    passwords,
    handleInputChange,
    handlePasswordChange,
    handleSubmitProfile,
    handleAvatarUpload,
    handlePasswordUpdate,
    refetchProfile,
  } = useProfileOperations();

  // Register refresh callback
  useEffect(() => {
    registerRefreshCallback("profile", refetchProfile);
    return () => {
      unregisterRefreshCallback("profile");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, refetchProfile]);

  // Check verification status
  useEffect(() => {
    if (!loading && formData) {
      if (!formData.idCardNumber) {
        navigate("/identity-verification");
      }
    }
  }, [loading, formData, navigate]);

  const isAdmin = useMemo(() => {
    const lsUsername = (localStorage.getItem("username") || "").toLowerCase();
    const apiUsername = (formData?.username || "").toLowerCase();
    return lsUsername === "admin" || apiUsername === "admin";
  }, [formData?.username]);

  const tabs = [
    {
      id: "overview",
      label: "Tổng quan hồ sơ",
      icon: <User size={18} />,
    },
    {
      id: "edit",
      label: "Chỉnh sửa hồ sơ",
      icon: <Edit3 size={18} />,
    },
    {
      id: "settings",
      label: "Cài đặt tài khoản",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
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
        <PageTitle
          title={t("profile.title")}
          subtitle={t("profile.subtitle")}
        />

        <div className="px-10 py-8 w-full max-w-7xl mx-auto">
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* Profile Header Card */}
              <div className="bg-white rounded-3xl border border-[#EFE6DA] shadow-[0_16px_40px_rgba(17,24,39,0.06)] p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar Section */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#F3E9DC] shadow-xl">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {formData.firstName?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Upload Overlay */}
                    <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white text-xs font-medium">
                          Change
                        </span>
                      </div>
                    </label>

                    {/* Verification Badge */}
                    {formData.idCardNumber && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {formData.firstName && formData.lastName
                        ? `${formData.firstName} ${formData.lastName}`
                        : formData.username || "User"}
                    </h2>
                    <p className="flex items-center gap-2 text-gray-600 mt-1">
                      <User size={16} className="shrink-0 opacity-70" />
                      <span className="truncate">
                        {formData.username || "username"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2 text-gray-500 mt-2">
                      <Mail size={16} className="shrink-0 opacity-70" />
                      <span className="truncate">
                        {formData.email || "No email provided"}
                      </span>
                    </p>

                    {formData?.id && (
                      <button
                        onClick={() => navigate(`/user/${formData.id}`)}
                        className="flex items-center gap-2 px-4 py-2 
      bg-orange-50 
      text-orange-700 
      rounded-lg 
      hover:bg-orange-100 
      transition-colors"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium">
                          {/* {t("profile.viewPublicProfile") || "View Profile"} */}
                          Xem trang cá nhân
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-2xl border border-[#EFE6DA] shadow-sm mb-6 overflow-hidden">
                <div className="flex border-b border-[#EFE6DA]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                        activeTab === tab.id
                          ? "text-orange-700 border-b-2 border-orange-500 bg-orange-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-2xl border border-[#EFE6DA] shadow-sm p-8">
                {activeTab === "overview" && (
                  <ProfileOverview
                    formData={formData}
                    onEditClick={() => setActiveTab("edit")}
                  />
                )}

                {activeTab === "edit" && (
                  <EditProfileForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmitProfile}
                    onCancel={() => setActiveTab("overview")}
                  />
                )}

                {activeTab === "settings" && (
                  <AccountSettings
                    passwords={passwords}
                    onChange={handlePasswordChange}
                    onSubmit={handlePasswordUpdate}
                    formData={formData}
                  />
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Profile;
