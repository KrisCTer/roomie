import React from "react";

const BookingFilters = ({
  bookingStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái đặt phòng <span className="text-red-500">*</span>
        </label>
        <select
          value={bookingStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING_APPROVAL">Đang chờ duyệt</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="PAUSED">Tạm dừng</option>
          <option value="TERMINATED">Kết thúc</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="RENEWED">Đã gia hạn</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Tìm kiếm theo số tham chiếu hoặc mã số bất động sản"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default BookingFilters;
