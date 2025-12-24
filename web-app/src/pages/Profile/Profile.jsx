// Profile.jsx
import React, { useState, useMemo } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx";
import { useTranslation } from "react-i18next";
// Import custom components
import AvatarAndScanner from "../../components/Profile/AvatarAndScanner.jsx";
import CameraModal from "../../components/Profile/CameraModal.jsx";
import ProfileInformationForm from "../../components/Profile/ProfileInformationForm.jsx";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm.jsx";
import ProfileSkeleton from "../../components/Profile/ProfileSkeleton.jsx";

// Import custom hook
import { useProfileOperations } from "../../hooks/useProfileOperations.js";

const Profile = () => {
  // Layout state
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useTranslation();

  // Use custom hook for profile operations
  const {
    loading,
    formData,
    passwords,
    showCamera,
    handleInputChange,
    handlePasswordChange,
    handleSubmitProfile,
    handleAvatarUpload,
    handleIdCardFileSelect,
    handlePasswordUpdate,
    handleOpenCamera,
    handleCloseCamera,
    handleCameraCapture,
  } = useProfileOperations();

  // ✅ Ưu tiên username trong localStorage để quyết định sidebar NGAY khi vào trang
  const isAdmin = useMemo(() => {
    const lsUsername = (localStorage.getItem("username") || "").toLowerCase();
    const apiUsername = (formData?.username || "").toLowerCase();
    return lsUsername === "admin" || apiUsername === "admin";
  }, [formData?.username]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <PageTitle
          title={t("profile.title")}
          subtitle={t("profile.subtitle")}
        />

        {/* Content */}
        <div className="px-10 py-8 w-full">
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <AvatarAndScanner
                avatarUrl={formData.avatarUrl}
                onAvatarUpload={handleAvatarUpload}
                onIdCardFileSelect={handleIdCardFileSelect}
                onOpenCamera={handleOpenCamera}
              />

              <CameraModal
                show={showCamera}
                onClose={handleCloseCamera}
                onCapture={handleCameraCapture}
              />

              <ProfileInformationForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmitProfile}
              />

              <ChangePasswordForm
                passwords={passwords}
                onChange={handlePasswordChange}
                onSubmit={handlePasswordUpdate}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
