import React from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../../components/layout/layoutUser/Header.jsx";
import Footer from "../../../components/layout/layoutUser/Footer.jsx";
import AlertMessage from "../../../components/common/AlertMessage";
import BookingsModal from "../../../components/domain/property/BookingsModal";
import PublishPropertyModal from "../../../components/domain/property/PublishPropertyModal";
import useMyPropertiesPageState from "./hooks/useMyPropertiesPageState";
import MyPropertiesMainSection from "./sections/MyPropertiesMainSection";
import "../../../styles/apple-glass-dashboard.css";
import "../../../styles/home-redesign.css";

const MyPropertiesPage = () => {
  const { t } = useTranslation();

  const {
    activeMenu,
    setActiveMenu,
    sidebarOpen,
    setSidebarOpen,
    pagedProperties,
    quickStats,
    properties,
    loading,
    postStatus,
    searchTerm,
    currentPage,
    totalPages,
    showBookingsModal,
    selectedProperty,
    propertyBookings,
    loadingBookings,
    creatingContract,
    showPublishModal,
    publishingProperty,
    setShowPublishModal,
    propertyStatus,
    alert,
    setPropertyStatus,
    setPostStatus,
    setSearchTerm,
    setCurrentPage,
    clearFilters,
    handleDelete,
    confirmPublishProperty,
    requestPublishProperty,
    handleEdit,
    handleViewBookings,
    handleCreateContract,
    handleCloseModal,
    setAlert,
    refetch,
  } = useMyPropertiesPageState();

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={t("property.myProperties")}
          pageSubtitle="Quản lý danh sách phòng, trạng thái đăng và lượt đặt chỗ"
        />

        <main className="w-full px-4 pb-8 pt-6 md:px-8">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />

          <MyPropertiesMainSection
            loading={loading}
            pagedProperties={pagedProperties}
            allProperties={properties}
            currentPage={currentPage}
            totalPages={totalPages}
            postStatus={postStatus}
            propertyStatus={propertyStatus}
            searchTerm={searchTerm}
            setPostStatus={setPostStatus}
            setPropertyStatus={setPropertyStatus}
            setSearchTerm={setSearchTerm}
            clearFilters={clearFilters}
            setCurrentPage={setCurrentPage}
            handleEdit={handleEdit}
            handleViewBookings={handleViewBookings}
            handleDelete={handleDelete}
            requestPublishProperty={requestPublishProperty}
            emptyTitle={t("property.noProperties")}
            emptyDescription={t("property.noPropertiesDesc")}
            clearFiltersLabel={t("common.clearFilters")}
            quickStats={quickStats}
            onRefresh={refetch}
          />
        </main>

        <Footer />
      </div>

      <PublishPropertyModal
        open={showPublishModal}
        property={publishingProperty}
        onConfirm={confirmPublishProperty}
        onCancel={() => setShowPublishModal(false)}
      />

      <BookingsModal
        show={showBookingsModal}
        onClose={handleCloseModal}
        selectedProperty={selectedProperty}
        bookings={propertyBookings}
        loading={loadingBookings}
        onCreateContract={handleCreateContract}
        creatingContract={creatingContract}
      />
    </div>
  );
};

export default MyPropertiesPage;
