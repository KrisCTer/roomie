// web-app/src/components/Property/PropertyFilters.jsx
import React from "react";
import { Search, Filter, X } from "lucide-react";

const PropertyFilters = ({
  postStatus,
  setPostStatus,
  propertyStatus,
  setPropertyStatus,
  searchTerm,
  setSearchTerm,
  onClearFilters,
}) => {
  const hasActiveFilters = postStatus || propertyStatus || searchTerm;

  return (
    <div className="mb-6 space-y-4">
      {/* Thanh tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề, địa chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hàng bộ lọc */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Bộ lọc:</span>
        </div>

        {/* Trạng thái bài đăng */}
        <select
          value={postStatus}
          onChange={(e) => setPostStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Tất cả trạng thái bài đăng</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>

        {/* Trạng thái bất động sản */}
        <select
          value={propertyStatus}
          onChange={(e) => setPropertyStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Tất cả trạng thái cho thuê</option>
          <option value="AVAILABLE">Còn trống</option>
          <option value="RENTED">Đã cho thuê</option>
          <option value="MAINTENANCE">Đang bảo trì</option>
        </select>

        {/* Nút xoá bộ lọc */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        )}

        {/* Số bộ lọc đang áp dụng */}
        {hasActiveFilters && (
          <span className="text-sm text-gray-600">
            {[postStatus, propertyStatus, searchTerm].filter(Boolean).length} bộ
            lọc đang áp dụng
          </span>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;
