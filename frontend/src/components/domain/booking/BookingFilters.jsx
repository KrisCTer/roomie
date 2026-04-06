import React from "react";

const BookingFilters = ({
  bookingStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Trạng thái đặt phòng
        </label>
        <select
          value={bookingStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-4 py-3 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tìm kiếm
        </label>
        <input
          type="text"
          placeholder="Tìm kiếm theo số tham chiếu hoặc mã số bất động sản"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 border border-[#E9DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
        />
      </div>
    </div>
  );
};

export default BookingFilters;
