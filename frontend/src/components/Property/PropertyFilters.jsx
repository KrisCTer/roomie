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
          className="w-full rounded-xl border border-[#E8D8C7] bg-[#FFFCF8] py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#CC6F4A]"
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
          className="rounded-xl border border-[#E8D8C7] bg-[#FFFCF8] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC6F4A]"
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
          className="rounded-xl border border-[#E8D8C7] bg-[#FFFCF8] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC6F4A]"
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
            className="flex items-center gap-2 rounded-xl bg-[#F2E6DA] px-4 py-2 text-sm text-[#8A5A44] transition hover:bg-[#EADACA]"
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
