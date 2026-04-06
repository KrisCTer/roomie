/* aria-label */
import React from "react";
import { X, FileText, User, Calendar, MapPin } from "lucide-react";

const BookingsModal = ({
  show,
  onClose,
  selectedProperty,
  bookings,
  loading,
  onCreateContract,
  creatingContract,
}) => {
  if (!show) return null;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Đặt chỗ đang hoạt động</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedProperty?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Hiện không có đặt chỗ nào khả dụng để tạo hợp đồng.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Đặt chỗ phải ở trạng thái ĐANG HOẠT ĐỘNG để tạo hợp đồng
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-[#E8D8C7] rounded-xl p-5 bg-[#FFFCF8]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-[#CC6F4A]" />
                        <span>Tenant: <strong>{booking.tenantId}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-[#CC6F4A]" />
                        <span>
                          {formatDate(booking.leaseStart)} → {formatDate(booking.leaseEnd)}
                        </span>
                      </div>
                      {booking.propertyId && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.propertyId}</span>
                        </div>
                      )}
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {booking.status}
                      </span>
                    </div>

                    <button
                      onClick={() => onCreateContract(booking)}
                      disabled={creatingContract}
                      className="flex items-center gap-2 rounded-lg bg-[#CC6F4A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b7603f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4" />
                      {creatingContract ? "Đang tạo..." : "Tạo hợp đồng"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsModal;
