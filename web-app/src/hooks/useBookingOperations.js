import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  getBooking,
  cancelBooking,
  confirmBooking,
  getOwnerBookings,
  getMyBookings,
} from "../services/booking.service";
import { getUserInfo } from "../services/localStorageService";

export const useBookingOperations = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("OWNER");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user info
  useEffect(() => {
    const user = getUserInfo();
    if (user) {
      setCurrentUserId(user.userId);
    }
  }, []);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [bookingStatus, searchTerm, currentPage, viewMode]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

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

  const closeModal = () => {
    setSelectedBooking(null);
  };

  return {
    // State
    bookings,
    loading,
    selectedBooking,
    bookingStatus,
    searchTerm,
    currentPage,
    totalPages,
    viewMode,
    currentUserId,

    // Setters
    setBookingStatus,
    setSearchTerm,
    setCurrentPage,
    setViewMode,

    // Handlers
    handleCancelBooking,
    handleConfirmBooking,
    handleViewDetails,
    getStatusConfig,
    transformBookingToCard,
    closeModal,
    fetchBookings,
  };
};