import React from "react";
import { Search } from "lucide-react";

const BillFilters = ({
  filterStatus,
  filterProperty,
  searchTerm,
  properties,
  activeTab,
  onStatusChange,
  onPropertyChange,
  onSearchChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái
        </label>
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-2 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
        >
          <option value="">Tất cả</option>
          {activeTab === "landlord" && <option value="DRAFT">Bản nháp</option>}
          <option value="PENDING">Đang chờ thanh toán</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="OVERDUE">Quá hạn</option>
        </select>
      </div>

      {/* Property Filter (Landlord only) */}
      {activeTab === "landlord" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property
          </label>
          <select
            value={filterProperty}
            onChange={(e) => onPropertyChange(e.target.value)}
            className="w-full px-4 py-2 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
          >
            <option value="">Tất cả các bất động sản</option>
            {properties.map((property) => (
              <option key={property.propertyId} value={property.propertyId}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hóa đơn..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default BillFilters;
