import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, CheckCircle } from "lucide-react";
import {
  getPropertiesByOwner,
  deleteProperty,
  updateProperty,
} from "../../services/property.service";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import { getPropertyBookings } from "../../services/booking.service";
import { createContract } from "../../services/contract.service";

const MyProperties = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Add Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [postStatus, setPostStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [propertyBookings, setPropertyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [creatingContract, setCreatingContract] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [postStatus, searchTerm, currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getPropertiesByOwner();

      if (response && response.success && response.result) {
        let propertiesData = response.result;

        if (postStatus) {
          propertiesData = propertiesData.filter(
            (property) =>
              property.status === postStatus ||
              property.propertyStatus === postStatus
          );
        }

        if (searchTerm) {
          propertiesData = propertiesData.filter((property) =>
            property.title?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setProperties(propertiesData);
        setTotalPages(Math.ceil(propertiesData.length / 10) || 1);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(propertyId);
        fetchProperties();
        alert("Property deleted successfully!");
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Failed to delete property");
      }
    }
  };

  const handleEdit = (propertyId) => {
    navigate(`/add-property?edit=${propertyId}`);
  };

  const handleViewBookings = async (property) => {
    try {
      setLoadingBookings(true);
      setShowBookingsModal(true);
      setSelectedProperty(property); // ⭐ lưu toàn bộ property để dùng ownerId

      const response = await getPropertyBookings(property.propertyId);

      if (response && response.success && response.result) {
        const activeBookings = response.result.filter(
          (booking) => booking.status === "ACTIVE" && !booking.hasContract
        );

        // ⭐ gán thêm landlordId vào từng booking luôn
        const mapped = activeBookings.map((b) => ({
          ...b,
          landlordId: property.owner?.ownerId,
        }));

        setPropertyBookings(mapped);
      } else {
        setPropertyBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setPropertyBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCreateContract = async (booking) => {
    if (!booking) return;

    if (
      window.confirm(
        `Create contract for booking ${booking.bookingReference || booking.id}?`
      )
    ) {
      try {
        setCreatingContract(true);

        // ⭐ FIX QUAN TRỌNG - THÊM landlordId
        const contractPayload = {
          bookingId: booking.id,
          propertyId: booking.propertyId,
          tenantId: booking.tenantId,
          landlordId: booking.landlordId || selectedProperty.owner?.ownerId, // ⭐ always correct
          startDate: booking.leaseStart,
          endDate: booking.leaseEnd,
        };

        console.log("PAYLOAD SENT → ", contractPayload);

        const response = await createContract(contractPayload);

        if (response && response.success) {
          alert("Contract created successfully!");
          setShowBookingsModal(false);
          navigate("/my-contracts");
        } else {
          alert(
            "Failed to create contract: " +
              (response?.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error creating contract:", error);
        alert(
          "Failed to create contract: " +
            (error?.response?.data?.message || error.message)
        );
      } finally {
        setCreatingContract(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { bg: "bg-orange-500", text: "Pending" },
      PENDING: { bg: "bg-orange-500", text: "Pending" },
      APPROVED: { bg: "bg-green-500", text: "Approved" },
      AVAILABLE: { bg: "bg-green-500", text: "Approved" },
      SOLD: { bg: "bg-purple-500", text: "Sold" },
      RENTED: { bg: "bg-purple-500", text: "Rented" },
    };
    return configs[status] || configs.PENDING;
  };

  const ListingCard = ({ listing }) => {
    const statusConfig = getStatusConfig(
      listing.status || listing.propertyStatus
    );

    return (
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border hover:shadow-md transition">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-24 h-24 object-cover rounded-lg"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{listing.date}</p>
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-semibold">{listing.price}</span>
            <span
              className={`px-3 py-1 rounded-full text-white text-xs ${statusConfig.bg}`}
            >
              {statusConfig.text}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={listing.onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Edit
          </button>

          <button
            onClick={listing.onViewBookings}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Contract
          </button>

          <button
            onClick={listing.onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const BookingsModal = () => {
    if (!showBookingsModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Active Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProperty?.title}
              </p>
            </div>
            <button
              onClick={() => setShowBookingsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {loadingBookings ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : propertyBookings.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  No active bookings available for contract creation
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Bookings must be in ACTIVE status to create contracts
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {propertyBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Booking #{booking.bookingReference || booking.id}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Tenant ID: {booking.tenantId}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Lease Period</p>
                        <p className="text-sm font-medium">
                          {formatDate(booking.leaseStart)} -{" "}
                          {formatDate(booking.leaseEnd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Monthly Rent</p>
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(booking.monthlyRent)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateContract(booking)}
                      disabled={creatingContract}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {creatingContract ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Contract...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Create Contract
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const transformPropertyToListing = (property) => {
    return {
      id: property.propertyId,
      image:
        property.mediaList?.[0]?.url ||
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
      title: property.title,
      date: formatDate(property.createdAt),
      price: `${property.monthlyRent?.toLocaleString()} VND`,
      status: property.status || property.propertyStatus,
      onEdit: () => handleEdit(property.propertyId),
      onViewBookings: () => handleViewBookings(property),
      onDelete: () => handleDelete(property.propertyId),
    };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Properties
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your properties and create contracts
              </p>
            </div>
            <button
              onClick={() => navigate("/add-property")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Property
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Status
              </label>
              <select
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No properties found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <ListingCard
                  key={property.propertyId}
                  listing={transformPropertyToListing(property)}
                />
              ))}
            </div>
          )}

          {!loading && properties.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              >
                ‹
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg transition ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              >
                ›
              </button>
            </div>
          )}
        </div>
        <Footer />
      </div>

      <BookingsModal />
    </div>
  );
};

export default MyProperties;
