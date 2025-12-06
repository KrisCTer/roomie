import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import BookingCard from "../../components/layout/layoutUser/BookingCard.jsx";
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  getBooking,
  cancelBooking,
  confirmBooking,
  getOwnerBookings,
  getMyBookings,
} from "../../services/booking.service";
import { getPropertyById } from "../../services/property.service";
import { getUserInfo } from "../../services/localStorageService";

const MyBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("MyBookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("TENANT"); // TENANT or OWNER
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user info
  useEffect(() => {
    const user = getUserInfo();
    if (user) {
      setCurrentUserId(user.userId);
    }
  }, []);

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, [bookingStatus, searchTerm, currentPage, viewMode]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Call different API based on view mode
      const response =
        viewMode === "OWNER" ? await getOwnerBookings() : await getMyBookings();

      console.log("Bookings API Response:", response);

      if (response && response.success && response.result) {
        let bookingsData = response.result;

        // Filter by status
        if (bookingStatus) {
          bookingsData = bookingsData.filter(
            (booking) => booking.status === bookingStatus
          );
        }

        // Filter by search term
        if (searchTerm) {
          bookingsData = bookingsData.filter(
            (booking) =>
              booking.propertyId
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              booking.bookingReference
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }

        setBookings(bookingsData);
        setTotalPages(Math.ceil(bookingsData.length / 10) || 1);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to fetch bookings. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelBooking(bookingId);
        alert("Booking cancelled successfully!");
        fetchBookings();
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (window.confirm("Confirm this booking?")) {
      try {
        await confirmBooking(bookingId);
        alert("Booking confirmed successfully!");
        fetchBookings();
      } catch (error) {
        console.error("Error confirming booking:", error);
        alert("Failed to confirm booking");
      }
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const response = await getBooking(bookingId);
      if (response && response.success) {
        setSelectedBooking(response.result);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      alert("Failed to load booking details");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING_APPROVAL: {
        bg: "bg-yellow-500",
        text: "Pending Approval",
        icon: <Clock className="w-4 h-4" />,
      },
      ACTIVE: {
        bg: "bg-green-500",
        text: "Active",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      PAUSED: {
        bg: "bg-blue-500",
        text: "Paused",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      TERMINATED: {
        bg: "bg-red-500",
        text: "Terminated",
        icon: <X className="w-4 h-4" />,
      },
      EXPIRED: {
        bg: "bg-gray-500",
        text: "Expired",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      RENEWED: {
        bg: "bg-purple-500",
        text: "Renewed",
        icon: <CheckCircle className="w-4 h-4" />,
      },
    };
    return configs[status] || configs.PENDING_APPROVAL;
  };

  // Check if current user is the owner of the booking's property
  const checkIsOwner = async (booking) => {
    try {
      const response = await getPropertyById(booking.propertyId);
      if (response && response.result) {
        return response.result.owner?.ownerId === currentUserId;
      }
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
    return false;
  };

  // Transform booking data to match BookingCard props
  const transformBookingToCard = (booking) => {
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const calculateDuration = (start, end) => {
      if (!start || !end) return "N/A";
      const startDate = new Date(start);
      const endDate = new Date(end);
      const months = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24 * 30)
      );
      return `${months} month${months > 1 ? "s" : ""}`;
    };

    return {
      id: booking.id,
      bookingReference: booking.bookingReference || booking.id,
      propertyId: booking.propertyId,
      leaseStart: formatDate(booking.leaseStart),
      leaseEnd: formatDate(booking.leaseEnd),
      duration: calculateDuration(booking.leaseStart, booking.leaseEnd),
      monthlyRent: booking.monthlyRent,
      rentalDeposit: booking.rentalDeposit,
      status: booking.status,
      createdAt: formatDate(booking.createdAt),
      onView: () => handleViewDetails(booking.id),
      onCancel: () => handleCancelBooking(booking.id),
      onConfirm:
        viewMode === "OWNER" ? () => handleConfirmBooking(booking.id) : null,
    };
  };

  const BookingDetailModal = ({ booking, onClose }) => {
    const [property, setProperty] = useState(null);
    const [loadingProperty, setLoadingProperty] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
      if (booking?.propertyId) {
        fetchPropertyDetails();
      }
    }, [booking]);

    const fetchPropertyDetails = async () => {
      try {
        setLoadingProperty(true);
        const response = await getPropertyById(booking.propertyId);
        if (response && response.result) {
          setProperty(response.result);
          // Check if current user is the owner
          const ownerCheck = response.result.owner?.ownerId === currentUserId;
          setIsOwner(ownerCheck);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoadingProperty(false);
      }
    };

    if (!booking) return null;

    const statusConfig = getStatusConfig(booking.status);

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const calculateTotalCost = () => {
      const start = new Date(booking.leaseStart);
      const end = new Date(booking.leaseEnd);
      const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
      const rentTotal = booking.monthlyRent * months;
      const deposit = booking.rentalDeposit || 0;
      return rentTotal + deposit;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Reference: {booking.bookingReference || booking.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Role Badge */}
            {isOwner && (
              <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  You are the property owner for this booking
                </p>
              </div>
            )}

            {/* Status Banner */}
            <div
              className={`${statusConfig.bg} text-white rounded-lg p-4 mb-6 flex items-center gap-3`}
            >
              {statusConfig.icon}
              <div>
                <div className="font-semibold">{statusConfig.text}</div>
                <div className="text-sm opacity-90">
                  {booking.status === "PENDING_APPROVAL" &&
                    (isOwner
                      ? "Please review and confirm this booking"
                      : "Waiting for owner's confirmation")}
                  {booking.status === "ACTIVE" &&
                    "Your lease is currently active"}
                  {booking.status === "TERMINATED" &&
                    "This booking has been terminated"}
                  {booking.status === "EXPIRED" && "This lease has expired"}
                </div>
              </div>
            </div>

            {/* Property Information */}
            {loadingProperty ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  Loading property details...
                </div>
              </div>
            ) : property ? (
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Property Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex gap-4">
                    {property.mediaList?.[0]?.url && (
                      <img
                        src={property.mediaList[0].url}
                        alt={property.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">
                        {property.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.address?.fullAddress ||
                          `${property.address?.district}, ${property.address?.province}`}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{property.bedrooms} beds</span>
                        <span>{property.bathrooms} baths</span>
                        <span>{property.size} m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 pb-6 border-b">
                <div className="text-sm text-gray-500">
                  Property ID: {booking.propertyId}
                </div>
              </div>
            )}

            {/* Lease Period */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Lease Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Start Date</div>
                  <div className="font-semibold text-lg">
                    {formatDate(booking.leaseStart)}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">End Date</div>
                  <div className="font-semibold text-lg">
                    {formatDate(booking.leaseEnd)}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Financial Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-semibold text-lg">
                    {booking.monthlyRent?.toLocaleString()} VND
                  </span>
                </div>
                {booking.rentalDeposit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rental Deposit:</span>
                    <span className="font-semibold text-lg">
                      {booking.rentalDeposit?.toLocaleString()} VND
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Total Estimated Cost:
                  </span>
                  <span className="font-bold text-2xl text-blue-600">
                    {calculateTotalCost().toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Booking Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Booking ID:</span>
                  <p className="font-medium mt-1">{booking.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Reference:</span>
                  <p className="font-medium mt-1">
                    {booking.bookingReference || booking.id}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Tenant ID:</span>
                  <p className="font-medium mt-1">{booking.tenantId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created At:</span>
                  <p className="font-medium mt-1">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Based on role and status */}
            <div className="flex gap-3 pt-4 border-t">
              {/* Confirm button - Only for owners on pending bookings */}
              {booking.status === "PENDING_APPROVAL" && isOwner && (
                <button
                  onClick={() => {
                    handleConfirmBooking(booking.id);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm Booking
                </button>
              )}

              {/* Cancel button - Different rules for tenant vs owner */}
              {(booking.status === "PENDING_APPROVAL" || // Both can cancel pending
                (isOwner && booking.status === "ACTIVE")) && ( // Only owner can terminate active
                <button
                  onClick={() => {
                    handleCancelBooking(booking.id);
                    onClose();
                  }}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  {booking.status === "ACTIVE"
                    ? "Terminate Lease"
                    : "Cancel Booking"}
                </button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

        <main className="p-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">
                Manage your property bookings and lease agreements
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  onClick={() => setViewMode("TENANT")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "TENANT"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  My Bookings (Tenant)
                </button>
                <button
                  onClick={() => setViewMode("OWNER")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "OWNER"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Property Bookings (Owner)
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="RENEWED">Renewed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Search by reference or property ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 p-6 border-b">
                {viewMode === "OWNER"
                  ? "Property Bookings (As Owner)"
                  : "My Bookings (As Tenant)"}
              </h2>

              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No bookings found</p>
                  <p className="text-sm mt-2">
                    {bookingStatus || searchTerm
                      ? "Try adjusting your filters"
                      : viewMode === "OWNER"
                      ? "No bookings for your properties yet"
                      : "You haven't made any bookings yet"}
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={transformBookingToCard(booking)}
                      isOwner={viewMode === "OWNER"}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && bookings.length > 0 && (
                <div className="flex items-center justify-center gap-2 px-6 py-6 border-t">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-3 py-2 text-gray-600">...</span>
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;
