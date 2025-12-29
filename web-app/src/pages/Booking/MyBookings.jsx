// web-app/src/pages/Booking/MyBookings.jsx
import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { useTranslation } from "react-i18next";
import { useRole } from "../../contexts/RoleContext";

// Import custom components
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
  const { t } = useTranslation();

  // ✅ Get activeRole from Context
  const { activeRole } = useRole();

  // ✅ Pass activeRole to hook
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
    handleCancelBooking,
    handleConfirmBooking,
    getStatusConfig,
    transformBookingToCard,
    closeModal,
  } = useBookingOperations(activeRole);

  // Transform bookings for display
  const transformedBookings = bookings.map(transformBookingToCard);

  const ownerCount = bookings.filter(
    (b) => b.landlordId === currentUserId
  ).length;

  const tenantCount = bookings.filter(
    (b) => b.tenantId === currentUserId
  ).length;

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
        {/* ✅ Header without role props (handled in Header component) */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <PageTitle
          title={t("booking.myBookings")}
          subtitle={t("booking.myBookingsSubtitle")}
        />

        <main className="p-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* ❌ Remove ViewModeToggle - Role toggle is now in Header */}

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
                isOwner={activeRole === "landlord"}
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
