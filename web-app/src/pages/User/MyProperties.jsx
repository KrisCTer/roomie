import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import ListingCard from "../../components/layout/layoutUser/ListingCard.jsx";
import { X } from "lucide-react";
import {
  getPropertiesByOwner,
  deleteProperty,
  updateProperty,
} from "../../services/property.service";

const MyProperties = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [postStatus, setPostStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("MyPropertys");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch properties from API
  useEffect(() => {
    fetchProperties();
  }, [postStatus, searchTerm, currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1,
        size: 10,
      };

      if (postStatus) {
        params.status = postStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await getPropertiesByOwner();
      console.log("API Response:", response);

      // Xử lý response - API trả về trực tiếp {code, success, message, result}
      if (response && response.success && response.result) {
        setProperties(response.result);
        setTotalPages(Math.ceil(response.result.length / 10) || 1);
      }
      // Fallback: nếu có response.data
      else if (response && response.data) {
        const data = response.data;
        if (data.result) {
          setProperties(data.result);
          setTotalPages(Math.ceil(data.result.length / 10) || 1);
        } else if (data.content) {
          setProperties(data.content);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          setProperties(data);
          setTotalPages(1);
        }
      }
      // Fallback: nếu response trực tiếp là array
      else if (Array.isArray(response)) {
        setProperties(response);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to fetch properties. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(propertyId);
        fetchProperties(); // Refresh list
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Failed to delete property");
      }
    }
  };

  const handleSold = async (propertyId) => {
    if (window.confirm("Mark this property as sold?")) {
      try {
        await updateProperty(propertyId, { status: "SOLD" });
        fetchProperties(); // Refresh list
        alert("Property marked as sold successfully!");
      } catch (error) {
        console.error("Error updating property:", error);
        alert("Failed to update property status");
      }
    }
  };

  const handleEdit = (propertyId) => {
    console.log("Edit property:", propertyId);
    window.location.href = `/add-property?edit=${propertyId}`;
  };

  const getStatusConfig = (status) => {
    const normalized = (status || "").toUpperCase();
    const configs = {
      DRAFT: { bg: "bg-orange-500", text: "Pending" },
      PENDING: { bg: "bg-orange-500", text: "Pending" },
      APPROVED: { bg: "bg-green-500", text: "Approved" },
      AVAILABLE: { bg: "bg-green-500", text: "Approved" },
      SOLD: { bg: "bg-purple-500", text: "Sold" },
      RENTED: { bg: "bg-purple-500", text: "Sold" },
      REJECT: { bg: "bg-red-500", text: "Rejected" },
      REJECTED: { bg: "bg-red-500", text: "Rejected" },
    };
    return configs[normalized] || configs.PENDING;
  };

  // Transform property data to match ListingCard props
  const transformPropertyToListing = (property) => {
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Get status text
    const getStatusText = (status) => {
      const normalized = (status || "").toUpperCase();
      const statusMap = {
        DRAFT: "Pending",
        PENDING: "Pending",
        APPROVED: "Approved",
        AVAILABLE: "Approved",
        SOLD: "Sold",
        RENTED: "Sold",
        REJECT: "Rejected",
        REJECTED: "Rejected",
      };
      return statusMap[normalized] || "Pending";
    };

    return {
      id: property.propertyId,
      image:
        property.mediaList?.[0]?.url ||
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
      title: property.title,
      date: formatDate(property.createdAt),
      price: `${property.monthlyRent?.toLocaleString()} VND`,
      status: getStatusText(property.status || property.propertyStatus),
      onEdit: () => handleEdit(property.propertyId),
      onSold: () => handleSold(property.propertyId),
      onDelete: () => handleDelete(property.propertyId),
      onClick: () => setSelectedProperty(property),
    };
  };

  const PropertyDetailModal = ({ property, onClose }) => {
    if (!property) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {property.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Images Gallery */}
            {property.mediaList && property.mediaList.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {property.mediaList.map((media, index) => (
                  <img
                    key={index}
                    src={media.url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Price and Status */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {property.monthlyRent?.toLocaleString()} VND
                </div>
                <div className="text-gray-600 text-sm">
                  Posted:{" "}
                  {new Date(property.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                {(() => {
                  const statusConfig = getStatusConfig(
                    property.status || property.propertyStatus
                  );
                  return (
                    <span
                      className={`px-4 py-2 rounded-full text-white text-sm font-medium ${statusConfig.bg}`}
                    >
                      {statusConfig.text}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Property Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{property.size} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-medium">
                      {property.bedrooms || property.rooms || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-medium">
                      {property.yearBuilt || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium mt-1">
                      {property.address?.fullAddress}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Province:</span>
                    <span className="font-medium">
                      {property.address?.province}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">District:</span>
                    <span className="font-medium">
                      {property.address?.district}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.homeSafety?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Home Safety
                      </h4>
                      <ul className="space-y-1">
                        {property.amenities.homeSafety.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.amenities.bedroom?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Bedroom
                      </h4>
                      <ul className="space-y-1">
                        {property.amenities.bedroom.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.amenities.kitchen?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Kitchen
                      </h4>
                      <ul className="space-y-1">
                        {property.amenities.kitchen.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.amenities.others?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Others
                      </h4>
                      <ul className="space-y-1">
                        {property.amenities.others.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Owner Information */}
            {property.owner && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Owner Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium mt-1">{property.owner.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium mt-1">
                        {property.owner.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium mt-1">
                        {property.owner.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {/* Filter Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Status <span className="text-red-500">*</span>
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
                  {/* có thể thêm REJECTED nếu sau này backend hỗ trợ filter */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search <span className="text-red-500">*</span>
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

            {/* Properties List */}
            <div className="bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 p-6 border-b">
                My Properties
              </h2>

              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading properties...
                </div>
              ) : properties.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No properties found
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {properties.map((property) => (
                    <ListingCard
                      key={property.propertyId}
                      listing={transformPropertyToListing(property)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && properties.length > 0 && (
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
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
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

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default MyProperties;
