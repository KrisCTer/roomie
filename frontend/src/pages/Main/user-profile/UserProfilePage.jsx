import React from "react";
import { Box, Container } from "@mui/material";
import StickyHeader from "../../../components/layout/layoutHome/StickyHeader";
import Footer from "../../../components/layout/layoutHome/Footer";
import useUserProfileData from "./hooks/useUserProfileData";
import { UserProfileLoadingSection, UserProfileErrorSection } from "./sections/UserProfileStatesSections";
import UserProfileHeaderSection from "./sections/UserProfileHeaderSection";
import UserProfilePropertiesSection from "./sections/UserProfilePropertiesSection";

const UserProfilePage = () => {
  const {
    loading,
    profile,
    properties,
    error,
    navigate,
    t,
    transformToCardData,
    handlePropertyClick,
    formatDate,
    getGenderDisplay,
  } = useUserProfileData();

  if (loading) return <UserProfileLoadingSection />;
  if (error || !profile) return <UserProfileErrorSection error={error} navigate={navigate} t={t} />;

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      <StickyHeader />
      <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <UserProfileHeaderSection
            profile={profile}
            formatDate={formatDate}
            getGenderDisplay={getGenderDisplay}
            t={t}
          />
          <UserProfilePropertiesSection
            properties={properties}
            transformToCardData={transformToCardData}
            handlePropertyClick={handlePropertyClick}
            t={t}
          />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default UserProfilePage;
