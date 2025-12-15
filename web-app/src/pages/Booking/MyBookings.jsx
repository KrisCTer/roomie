import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

// Import custom components
import ViewModeToggle from "../../components/Booking/ViewModeToggle.jsx";
import BookingFilters from "../../components/Booking/BookingFilters.jsx";
import BookingsList from "../../components/Booking/BookingsList.jsx";
import BookingsPagination from "../../components/Booking/BookingsPagination.jsx";
import BookingDetailModal from "../../components/Booking/BookingDetailModal.jsx";

// Import custom hook
import { useBookingOperations } from "../../hooks/useBookingOperations.js";

const MyBookings = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("MyBookings");

  // Use custom hook for booking operations
  const {
    bookings,
    loading,
    selectedBooking,
    bookingStatus,
    searchTerm,
    currentPage,
    totalPages,
    viewMode,
    currentUserId,
    setBookingStatus,
    setSearchTerm,
    setCurrentPage,
    setViewMode,
    handleCancelBooking,
    handleConfirmBooking,
    getStatusConfig,
    transformBookingToCard,
    closeModal,
  } = useBookingOperations();

  // Transform bookings for display
  const transformedBookings = bookings.map(transformBookingToCard);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <PageTitle
          title="My Bookings"
          subtitle="Manage your property bookings and lease agreements"
        />
        <main className="p-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Filters */}
            <BookingFilters
              bookingStatus={bookingStatus}
              onStatusChange={setBookingStatus}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-sm">
              <BookingsList
                bookings={transformedBookings}
                loading={loading}
                viewMode={viewMode}
                isOwner={viewMode === "OWNER"}
                bookingStatus={bookingStatus}
                searchTerm={searchTerm}
              />

              {/* Pagination */}
              {!loading && bookings.length > 0 && (
                <BookingsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={closeModal}
          currentUserId={currentUserId}
          getStatusConfig={getStatusConfig}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
};

export default MyBookings;
