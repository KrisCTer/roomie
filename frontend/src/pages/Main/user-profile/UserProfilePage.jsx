/* SEO_META: title="Roomie - User Profile"; name="description"; property="og:title" */
import React from "react";
import EditorialHeader from "../../../components/layout/layoutHome/EditorialHeader";
import EditorialFooter from "../../../components/layout/layoutHome/EditorialFooter";
import useUserProfileData from "./hooks/useUserProfileData";
import { UserProfileLoadingSection, UserProfileErrorSection } from "./sections/UserProfileStatesSections";
import UserProfileHeaderSection from "./sections/UserProfileHeaderSection";
import UserProfilePropertiesSection from "./sections/UserProfilePropertiesSection";

import "../../../styles/apple-glass-dashboard.css";
import "../../../styles/home-redesign.css";

const UserProfilePage = () => {
  const {
    loading, profile, properties, error,
    navigate, t,
    handlePropertyClick, formatDate, getGenderDisplay,
  } = useUserProfileData();

  if (loading) return <UserProfileLoadingSection />;
  if (error || !profile) return <UserProfileErrorSection error={error} navigate={navigate} t={t} />;

  return (
    <div className="home-v2 min-h-screen bg-[var(--home-bg)]">
      <EditorialHeader />
      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
        <UserProfileHeaderSection
          profile={profile}
          formatDate={formatDate}
          getGenderDisplay={getGenderDisplay}
          t={t}
        />
        <UserProfilePropertiesSection
          properties={properties}
          handlePropertyClick={handlePropertyClick}
        />
      </main>
      <EditorialFooter description="Xem thông tin và danh sách bất động sản của người cho thuê trên Roomie." />
    </div>
  );
};

export default UserProfilePage;
