/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
// web-app/src/pages/Property/MyProperties.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { useTranslation } from "react-i18next";

import PropertyFilters from "../../components/Property/PropertyFilters";
import PropertyList from "../../components/Property/PropertyList";
import BookingsModal from "../../components/Property/BookingsModal";
import Pagination from "../../components/Property/Pagination";
import PublishPropertyModal from "../../components/Property/PublishPropertyModal";
import AlertMessage from "../../components/common/AlertMessage";

import { usePropertyOperations } from "../../hooks/usePropertyOperations";
import { useRefresh } from "../../contexts/RefreshContext";

const MyProperties = () => {
  const [activeMenu, setActiveMenu] = useState("My Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useTranslation();

  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

  const {
    properties,
    loading,
    refetch,
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
  } = usePropertyOperations();

  useEffect(() => {
    registerRefreshCallback("my-properties", refetch);

    return () => {
      unregisterRefreshCallback("my-properties");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, refetch]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <PageTitle
          title={t("property.myProperties")}
          subtitle={t("My Bookings")}
        />

        {/* Content */}
        <main className="p-8 w-full">
          {/* Alert Message */}
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />

          {/* Properties Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Filters */}
            <PropertyFilters
              postStatus={postStatus}
              setPostStatus={setPostStatus}
              propertyStatus={propertyStatus}
              setPropertyStatus={setPropertyStatus}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onClearFilters={clearFilters}
            />

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {/* Property List */}
            {!loading && (
              <>
                <PropertyList
                  properties={properties}
                  loading={loading}
                  onEdit={handleEdit}
                  onViewBookings={handleViewBookings}
                  onDelete={handleDelete}
                  onPublish={requestPublishProperty}
                />

                {/* Pagination */}
                {properties.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}

                {/* Empty State */}
                {properties.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("property.noProperties")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("property.noPropertiesDesc")}
                    </p>
                    {(postStatus || propertyStatus || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {t("common.clearFilters")}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Publish Property Modal */}
      <PublishPropertyModal
        open={showPublishModal}
        property={publishingProperty}
        onConfirm={confirmPublishProperty}
        onCancel={() => setShowPublishModal(false)}
      />

      {/* Bookings Modal */}
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

export default MyProperties;


