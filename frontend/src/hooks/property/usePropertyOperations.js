// web-app/src/hooks/usePropertyOperations.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../../contexts/DialogContext";
import {
  getPropertiesByOwner,
  deleteProperty,
  publishProperty,
} from "../../services/propertyService";
import { getPropertyBookings } from "../../services/bookingService";
import { createContract } from "../../services/contractService";

export const usePropertyOperations = () => {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useDialog();

  // ================== CORE DATA ==================
  const [allProperties, setAllProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================== FILTER ==================
  const [postStatus, setPostStatus] = useState("");
  const [propertyStatus, setPropertyStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ================== PAGINATION ==================
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================== ALERT ==================
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ================== MODAL STATE ==================
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyBookings, setPropertyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishingProperty, setPublishingProperty] = useState(null);

  // =================================================
  // ✅ FETCH DATA FUNCTION (useCallback để stable reference)
  // =================================================
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPropertiesByOwner();
      if (response?.success) {
        setAllProperties(response.result || []);
      } else {
        setAlert({
          type: "error",
          message: "Failed to fetch properties",
        });
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setAlert({
        type: "error",
        message: "Failed to fetch properties",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // =================================================
  // ✅ REFETCH FUNCTION (public API)
  // =================================================
  const refetch = useCallback(async () => {
    await fetchProperties();
  }, [fetchProperties]);

  // =================================================
  // INITIAL FETCH
  // =================================================
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // =================================================
  // FILTER LOCAL (KHÔNG LOADING)
  // =================================================
  useEffect(() => {
    let filtered = [...allProperties];

    // Filter by post status (DRAFT, PENDING, APPROVED, etc.)
    if (postStatus) {
      filtered = filtered.filter(
        (p) => (p.status || "").toUpperCase() === postStatus.toUpperCase()
      );
    }

    // Filter by property status (AVAILABLE, RENTED, etc.)
    if (propertyStatus) {
      filtered = filtered.filter(
        (p) => (p.propertyStatus || "").toUpperCase() === propertyStatus.toUpperCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) =>
        (p.title || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term) ||
        (p.address?.fullAddress || "").toLowerCase().includes(term)
      );
    }

    setProperties(filtered);
    setTotalPages(Math.ceil(filtered.length / 10) || 1);
  }, [postStatus, propertyStatus, searchTerm, allProperties]);

  // =================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [postStatus, propertyStatus, searchTerm]);

  // =================================================
  // AUTO HIDE ALERT (5s)
  // =================================================
  useEffect(() => {
    if (!alert.message) return;

    const timer = setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [alert.message]);

  // =================================================
  // CRUD HANDLERS
  // =================================================
  const handleEdit = useCallback((propertyId) => {
    navigate(`/add-property?edit=${propertyId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (propertyId) => {
    const confirmed = await showConfirm({
      title: "Xóa bất động sản",
      message: "Bạn có chắc chắn muốn xóa bất động sản này? Thao tác này không thể hoàn tác.",
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteProperty(propertyId);
      
      // Update local state immediately
      setAllProperties((prev) =>
        prev.filter((p) => p.propertyId !== propertyId)
      );
      
      setAlert({
        type: "success",
        message: "Property deleted successfully",
      });
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to delete property",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // =================================================
  // BOOKINGS
  // =================================================
  const handleViewBookings = useCallback(async (property) => {
    try {
      setLoadingBookings(true);
      setShowBookingsModal(true);
      setSelectedProperty(property);

      const response = await getPropertyBookings(property.propertyId);
      if (response?.success) {
        const activeBookings = (response.result || []).filter(
          (b) => b.status === "ACTIVE" && !b.hasContract
        );

        setPropertyBookings(
          activeBookings.map((b) => ({
            ...b,
            landlordId: property.owner?.ownerId,
          }))
        );
      } else {
        setPropertyBookings([]);
      }
    } catch (error) {
      console.error(error);
      setPropertyBookings([]);
      setAlert({
        type: "error",
        message: "Failed to load bookings",
      });
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const handleCreateContract = useCallback(async (booking) => {
    if (!booking) return;

    const confirmed = await showConfirm({
      title: "Tạo hợp đồng",
      message: "Tạo hợp đồng cho đặt phòng này?",
      confirmText: "Tạo hợp đồng",
      cancelText: "Hủy",
      type: "question",
    });
    if (!confirmed) return;

    try {
      setCreatingContract(true);
      const payload = {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        tenantId: booking.tenantId,
        landlordId: booking.landlordId,
        startDate: booking.leaseStart,
        endDate: booking.leaseEnd,
      };

      const response = await createContract(payload);
      if (response?.success) {
        showToast("Tạo hợp đồng thành công!", "success");
        setShowBookingsModal(false);
        
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/my-contracts");
        }, 1000);
      } else {
        showToast(response?.message || "Tạo hợp đồng thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      const msg = status === 409
        ? "Hợp đồng cho đặt phòng này đã tồn tại!"
        : error?.response?.data?.message || "Tạo hợp đồng thất bại";
      showToast(msg, status === 409 ? "warning" : "error");
    } finally {
      setCreatingContract(false);
    }
  }, [navigate]);

  // =================================================
  // PUBLISH PROPERTY
  // =================================================
  const requestPublishProperty = useCallback((property) => {
    setPublishingProperty(property);
    setShowPublishModal(true);
  }, []);

  const confirmPublishProperty = useCallback(async () => {
    if (!publishingProperty) return;

    try {
      setLoading(true);
      const response = await publishProperty(publishingProperty.propertyId);

      if (response?.success) {
        setAlert({
          type: "success",
          message: "Property sent for approval successfully",
        });

        // Update local data
        setAllProperties((prev) =>
          prev.map((p) =>
            p.propertyId === publishingProperty.propertyId
              ? { ...p, status: "PENDING" }
              : p
          )
        );
      } else {
        setAlert({
          type: "error",
          message: response?.message || "Publish failed",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Publish failed",
      });
    } finally {
      setLoading(false);
      setShowPublishModal(false);
      setPublishingProperty(null);
    }
  }, [publishingProperty]);

  // =================================================
  // CLOSE MODALS
  // =================================================
  const handleCloseModal = useCallback(() => {
    setShowBookingsModal(false);
    setSelectedProperty(null);
    setPropertyBookings([]);
  }, []);

  // =================================================
  // CLEAR FILTERS
  // =================================================
  const clearFilters = useCallback(() => {
    setPostStatus("");
    setPropertyStatus("");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // =================================================
  // EXPORT
  // =================================================
  return {
    // ✅ Data
    properties,
    allProperties,
    loading,
    totalPages,
    currentPage,

    // ✅ Filters
    postStatus,
    propertyStatus,
    searchTerm,
    setPostStatus,
    setPropertyStatus,
    setSearchTerm,
    setCurrentPage,
    clearFilters,

    // ✅ Bookings
    showBookingsModal,
    selectedProperty,
    propertyBookings,
    loadingBookings,
    creatingContract,

    // ✅ Publish
    showPublishModal,
    publishingProperty,
    requestPublishProperty,
    confirmPublishProperty,
    setShowPublishModal,

    // ✅ Alerts
    alert,
    setAlert,

    // ✅ Handlers
    handleEdit,
    handleDelete,
    handleViewBookings,
    handleCreateContract,
    handleCloseModal,

    // ✅ Refetch (KEY ADDITION!)
    refetch,
    fetchProperties,
  };
};