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
  Shield,
  Edit3,
  Camera,
  CheckCircle,
  Mail,
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
  const [activeTab, setActiveTab] = useState("overview"); // overview, edit, settings
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
      label: "Profile Overview",
      icon: <User size={18} />,
    },
    {
      id: "edit",
      label: "Edit Profile",
      icon: <Edit3 size={18} />,
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-primary">
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
              <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-lg p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar Section */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-dark-primary shadow-xl">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-primary">
                      {formData.firstName && formData.lastName
                        ? `${formData.firstName} ${formData.lastName}`
                        : formData.username || "User"}
                    </h2>
                    <p className="flex items-center gap-2 text-gray-600 dark:text-dark-secondary mt-1">
                      <User size={16} className="shrink-0 opacity-70" />
                      <span className="truncate">
                        {formData.username || "username"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2 text-gray-500 dark:text-dark-tertiary mt-2">
                      <Mail size={16} className="shrink-0 opacity-70" />
                      <span className="truncate">
                        {formData.email || "No email provided"}
                      </span>
                    </p>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                      {!formData.idCardNumber && (
                        <button
                          onClick={() => navigate("/identity-verification")}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                        >
                          <Shield size={16} />
                          <span className="text-sm font-medium">
                            Verify Identity
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-dark-primary">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                        activeTab === tab.id
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "text-gray-600 dark:text-dark-secondary hover:text-gray-900 dark:hover:text-dark-primary hover:bg-gray-50 dark:hover:bg-dark-hover"
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-8">
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
