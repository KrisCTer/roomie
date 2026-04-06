/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
/* aria-label */
// web-app/src/pages/Booking/MyBookings.jsx
import React, { useState } from "react";
import {
  List as ListIcon,
  Clock as ClockIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
} from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import StatCard from "../../components/domain/dashboard/StatCard.jsx";
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
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={
            activeRole === "landlord"
              ? t("booking.landlordTitle")
              : t("booking.tenantTitle")
          }
          pageSubtitle={
            activeRole === "landlord"
              ? t("booking.landlordSubtitle")
              : t("booking.tenantSubtitle")
          }
        />

        <main className="w-full px-4 pb-8 pt-6 md:px-8">
          <section className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {activeRole === "landlord" ? (
                <>
                  <StatCard
                    icon={ListIcon}
                    label={t("booking.totalBookings")}
                    value={bookings.length}
                    color="blue"
                  />
                  <StatCard
                    icon={ClockIcon}
                    label={t("booking.pendingCount")}
                    value={
                      bookings.filter(
                        (b) => b.status === "PENDING" || b.status === "ACTIVE",
                      ).length
                    }
                    color="yellow"
                  />
                  <StatCard
                    icon={CheckCircleIcon}
                    label={t("booking.confirmedCount")}
                    value={
                      bookings.filter((b) => b.status === "CONFIRMED").length
                    }
                    color="green"
                  />
                  <StatCard
                    icon={XCircleIcon}
                    label={t("booking.cancelledCount")}
                    value={
                      bookings.filter((b) => b.status === "CANCELLED").length
                    }
                    color="red"
                  />
                </>
              ) : (
                <>
                  <StatCard
                    icon={ListIcon}
                    label={t("booking.totalBookings")}
                    value={bookings.length}
                    color="blue"
                  />
                  <StatCard
                    icon={ClockIcon}
                    label={t("booking.activeCount")}
                    value={
                      bookings.filter(
                        (b) => b.status === "ACTIVE" || b.status === "PENDING",
                      ).length
                    }
                    color="yellow"
                  />
                  <StatCard
                    icon={CheckCircleIcon}
                    label={t("booking.completedCount")}
                    value={
                      bookings.filter((b) => b.status === "COMPLETED").length
                    }
                    color="green"
                  />
                  <StatCard
                    icon={XCircleIcon}
                    label={t("booking.cancelledCount")}
                    value={
                      bookings.filter((b) => b.status === "CANCELLED").length
                    }
                    color="red"
                  />
                </>
              )}
            </div>

            <div className="home-glass-soft sticky top-24 z-20 rounded-2xl p-4">
              <BookingFilters
                bookingStatus={bookingStatus}
                onStatusChange={setBookingStatus}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            <BookingsList
              bookings={transformedBookings}
              loading={loading}
              viewMode={viewMode}
              isOwner={activeRole === "landlord"}
              bookingStatus={bookingStatus}
              searchTerm={searchTerm}
            />

            {!loading && bookings.length > 0 && (
              <BookingsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </section>
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
