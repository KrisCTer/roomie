import React from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import { User, ChevronLeft } from "lucide-react";
import StickyHeader from "../../../../components/layout/layoutHome/StickyHeader";
import Footer from "../../../../components/layout/layoutHome/Footer";

const UserProfileLoadingSection = () => (
  <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
    <StickyHeader />
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <CircularProgress size={48} />
    </Box>
    <Footer />
  </Box>
);

const UserProfileErrorSection = ({ error, navigate, t }) => (
  <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
    <StickyHeader />
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error || t("userProfile.notFound")}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
        >
          <ChevronLeft className="w-5 h-5" />
          {t("userProfile.back")}
        </button>
      </div>
    </Container>
    <Footer />
  </Box>
);

export { UserProfileLoadingSection, UserProfileErrorSection };
