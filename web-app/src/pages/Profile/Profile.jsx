import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx";

// Import custom components
import AvatarAndScanner from "../../components/Profile/AvatarAndScanner.jsx";
import CameraModal from "../../components/Profile/CameraModal.jsx";
import ProfileInformationForm from "../../components/Profile/ProfileInformationForm.jsx";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm.jsx";
import ProfileSkeleton from "../../components/Profile/ProfileSkeleton.jsx";

// Import custom hook
import { useProfileOperations } from "../../hooks/useProfileOperations.js";

const isAdmin = formData.username?.toLowerCase() === "admin";

const Profile = () => {
  // Layout state
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          title="Profile"
          subtitle="View and update your profile information"
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
