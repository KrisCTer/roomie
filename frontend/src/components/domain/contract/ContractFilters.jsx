import React from "react";

const ContractFilters = ({
  contractStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Trạng thái hợp đồng
        </label>
        <select
          value={contractStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-3 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="PENDING_SIGNATURE">Chờ ký</option>
          <option value="PENDING_PAYMENT">Chờ thanh toán</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="TERMINATED">Kết thúc</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tìm kiếm
        </label>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa chỉ hoặc mã hợp đồng"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
        />
      </div>
    </div>
  );
};

export default ContractFilters;
