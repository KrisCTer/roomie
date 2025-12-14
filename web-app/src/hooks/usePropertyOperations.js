import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPropertiesByOwner,
  deleteProperty,
  publishProperty,
} from "../services/property.service";
import { getPropertyBookings } from "../services/booking.service";
import { createContract } from "../services/contract.service";

export const usePropertyOperations = () => {
  const navigate = useNavigate();

  // ================== CORE DATA ==================
  const [allProperties, setAllProperties] = useState([]); // data gốc
  const [properties, setProperties] = useState([]);       // data hiển thị
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
  // FETCH DATA (CHỈ 1 LẦN)
  // =================================================
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const response = await getPropertiesByOwner();
        if (response?.success) {
          setAllProperties(response.result || []);
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
    };

    fetch();
  }, []);

  // =================================================
  // FILTER LOCAL (KHÔNG LOADING)
  // =================================================
  useEffect(() => {
    let filtered = [...allProperties];

    if (postStatus) {
      filtered = filtered.filter(
        (p) => p.status === postStatus
      );
    }

    if (propertyStatus) {
      filtered = filtered.filter(
        (p) => p.propertyStatus === propertyStatus
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleEdit = (propertyId) => {
    navigate(`/add-property?edit=${propertyId}`);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      await deleteProperty(propertyId);
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
        message: "Failed to delete property",
      });
    }
  };

  // =================================================
  // BOOKINGS
  // =================================================
  const handleViewBookings = async (property) => {
    try {
      setLoadingBookings(true);
      setShowBookingsModal(true);
      setSelectedProperty(property);

      const response = await getPropertyBookings(property.propertyId);
      if (response?.success) {
        const activeBookings = response.result.filter(
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
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCreateContract = async (booking) => {
    if (!booking) return;

    if (!window.confirm("Create contract for this booking?")) return;

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
        setShowBookingsModal(false);
        navigate("/my-contracts");
      } else {
        setAlert({
          type: "error",
          message: response?.message || "Create contract failed",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "Create contract failed",
      });
    } finally {
      setCreatingContract(false);
    }
  };

  // =================================================
  // PUBLISH PROPERTY
  // =================================================
  const requestPublishProperty = (property) => {
    setPublishingProperty(property);
    setShowPublishModal(true);
  };

  const confirmPublishProperty = async () => {
    if (!publishingProperty) return;

    try {
      setLoading(true);
      const response = await publishProperty(publishingProperty.propertyId);

      if (response?.success) {
        setAlert({
          type: "success",
          message: "Property sent for approval successfully",
        });

        // update local data
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
        message: "Publish failed",
      });
    } finally {
      setLoading(false);
      setShowPublishModal(false);
      setPublishingProperty(null);
    }
  };

  // =================================================
  // CLOSE MODALS
  // =================================================
  const handleCloseModal = () => {
    setShowBookingsModal(false);
    setSelectedProperty(null);
    setPropertyBookings([]);
  };

  // =================================================
  // EXPORT
  // =================================================
  return {
    // data
    properties,
    loading,
    totalPages,
    currentPage,

    // filters
    postStatus,
    propertyStatus,
    searchTerm,

    setPostStatus,
    setPropertyStatus,
    setSearchTerm,
    setCurrentPage,

    // bookings
    showBookingsModal,
    selectedProperty,
    propertyBookings,
    loadingBookings,
    creatingContract,

    // publish
    showPublishModal,
    publishingProperty,
    requestPublishProperty,
    confirmPublishProperty,

    // alerts
    alert,
    setAlert,

    // handlers
    handleEdit,
    handleDelete,
    handleViewBookings,
    handleCreateContract,
    handleCloseModal,
  };
};
