import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import {
  getBooking,
  cancelBooking,
  confirmBooking,
  getOwnerBookings,
  getMyBookings,
} from "../../services/bookingService";
import { getUserInfo } from "../../services/localStorageService";
import { useDialog } from "../../contexts/DialogContext";

export const useBookingOperations = () => {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useDialog();
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
      showToast("Không thể tải danh sách đặt phòng.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirm({
      title: "Hủy đặt phòng",
      message: "Bạn có chắc chắn muốn hủy đặt phòng này?",
      confirmText: "Hủy đặt phòng",
      cancelText: "Quay lại",
      type: "danger",
    });
    if (confirmed) {
      try {
        await cancelBooking(bookingId);
        showToast("Đã hủy đặt phòng thành công!", "success");
        fetchBookings();
      } catch (error) {
        console.error("Error cancelling booking:", error);
        showToast("Không thể hủy đặt phòng.", "error");
      }
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    const confirmed = await showConfirm({
      title: "Xác nhận đặt phòng",
      message: "Xác nhận đặt phòng này?",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
      type: "question",
    });
    if (confirmed) {
      try {
        await confirmBooking(bookingId);
        showToast("Đã xác nhận đặt phòng thành công!", "success");
        fetchBookings();
      } catch (error) {
        console.error("Error confirming booking:", error);
        showToast("Không thể xác nhận đặt phòng.", "error");
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
      showToast("Không thể tải chi tiết đặt phòng.", "error");
    }
  };

  const handleViewTenantProfile = (tenantId) => {
    // Navigate to user profile page
    navigate(`/user/${tenantId}`);
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
      tenantId: booking.tenantId,
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
      onViewTenantProfile:
        viewMode === "OWNER" && booking.tenantId
          ? () => handleViewTenantProfile(booking.tenantId)
          : null,
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
    handleViewTenantProfile,
    getStatusConfig,
    transformBookingToCard,
    closeModal,
    fetchBookings,
  };
};