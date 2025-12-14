import React from "react";
import { Filter, Search } from "lucide-react";

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
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            {activeTab === "landlord" && <option value="DRAFT">Nháp</option>}
            <option value="PENDING">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="OVERDUE">Quá hạn</option>
          </select>
        </div>

        {/* Property Filter (Landlord only) */}
        {activeTab === "landlord" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bất động sản
            </label>
            <select
              value={filterProperty}
              onChange={(e) => onPropertyChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả bất động sản</option>
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
              placeholder="Tìm theo mã hóa đơn..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillFilters;
