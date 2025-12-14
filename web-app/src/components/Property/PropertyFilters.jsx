import React from "react";

const PropertyFilters = ({
  postStatus,
  setPostStatus,
  propertyStatus,
  setPropertyStatus,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* ===== POST STATUS ===== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Status
        </label>
        <select
          value={postStatus}
          onChange={(e) => setPostStatus(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* ===== PROPERTY STATUS ===== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Status
        </label>
        <select
          value={propertyStatus}
          onChange={(e) => setPropertyStatus(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* ===== SEARCH ===== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default PropertyFilters;
