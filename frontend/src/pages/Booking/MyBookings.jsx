/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
// web-app/src/pages/Booking/MyBookings.jsx
import React, { useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";
import { useTranslation } from "react-i18next";
import { useRole } from "../../contexts/RoleContext";
import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

// Import custom components
import BookingFilters from "../../components/domain/booking/BookingFilters.jsx";
import BookingsList from "../../components/domain/booking/BookingsList.jsx";
import BookingsPagination from "../../components/domain/booking/BookingsPagination.jsx";
import BookingDetailModal from "../../components/domain/booking/BookingDetailModal.jsx";

// Import custom hook
import { useBookingOperations } from "../../hooks/booking/useBookingOperations.jsx";

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
    (b) => b.landlordId === currentUserId,
  ).length;

  const tenantCount = bookings.filter(
    (b) => b.tenantId === currentUserId,
  ).length;

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
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

        <main className="w-full px-4 pb-8 md:px-8">
          <div className="apple-glass-panel p-6 mb-6">
            <div className="mb-6 rounded-2xl border border-[#EBDCC8] bg-gradient-to-r from-[#FFF8EE] to-[#FFFCF8] px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center rounded-full bg-white border border-[#ECDDC8] px-3 py-1 font-semibold text-gray-700">
                Tổng booking: {bookings.length}
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-[#ECDDC8] px-3 py-1 font-semibold text-gray-700">
                Vai trò chủ nhà: {ownerCount}
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-[#ECDDC8] px-3 py-1 font-semibold text-gray-700">
                Vai trò người thuê: {tenantCount}
              </span>
            </div>

            {/* ❌ Remove ViewModeToggle - Role toggle is now in Header */}

            {/* Filters */}
            <BookingFilters
              bookingStatus={bookingStatus}
              onStatusChange={setBookingStatus}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {/* Bookings List */}
            <div className="apple-glass-panel">
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
