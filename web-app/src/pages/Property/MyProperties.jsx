import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

// Import custom components
// import PropertyHeader from "../../components/Property/PropertyHeader";
import PropertyFilters from "../../components/Property/PropertyFilters";
import PropertyList from "../../components/Property/PropertyList";
import BookingsModal from "../../components/Property/BookingsModal";
import Pagination from "../../components/Property/Pagination";
import PublishPropertyModal from "../../components/Property/PublishPropertyModal";
import AlertMessage from "../../components/common/AlertMessage";

// Import custom hook
import { usePropertyOperations } from "../../hooks/usePropertyOperations";

const MyProperties = () => {
  // Layout state
  const [activeMenu, setActiveMenu] = useState("My Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use custom hook for property operations
  const {
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
    handleDelete,
    confirmPublishProperty,
    requestPublishProperty,
    handleEdit,
    handleViewBookings,
    handleCreateContract,
    handleCloseModal,
    setAlert,
  } = usePropertyOperations();

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
          title="Property Form"
          subtitle="Create or update a new property listing"
        />
        {/* Content */}
        <main className="p-8 w-full">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Filters */}
            <PropertyFilters
              postStatus={postStatus}
              setPostStatus={setPostStatus}
              propertyStatus={propertyStatus}
              setPropertyStatus={setPropertyStatus}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {/* Property List */}
            <PropertyList
              properties={properties}
              loading={loading}
              onEdit={handleEdit}
              onViewBookings={handleViewBookings}
              onDelete={handleDelete}
              onPublish={requestPublishProperty}
            />
            <PublishPropertyModal
              open={showPublishModal}
              property={publishingProperty}
              onConfirm={confirmPublishProperty}
              onCancel={() => setShowPublishModal(false)}
            />
            {/* Pagination */}
            {!loading && properties.size > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>
        {/* Footer */}
        <Footer />
      </div>

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
