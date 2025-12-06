import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Home,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Download,
  MessageCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/layoutHome/Header.jsx";
import Footer from "../../components/layout/layoutHome/Footer.jsx";
import { getBooking, cancelBooking } from "../../services/booking.service";
import { getPropertyById } from "../../services/property.service";
import { createConversation } from "../../services/chat.service";
import { getUserInfo } from "../../services/localStorageService";

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [contactingOwner, setContactingOwner] = useState(false);

  useEffect(() => {
    const currentUser = getUserInfo();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);

      // Load booking
      const bookingResponse = await getBooking(id);
      const bookingData =
        bookingResponse?.result || bookingResponse?.data?.result;

      if (!bookingData) {
        throw new Error("Booking not found");
      }

      setBooking(bookingData);

      // Load property details
      try {
        const propertyResponse = await getPropertyById(bookingData.propertyId);
        setProperty(propertyResponse?.result || propertyResponse?.data?.result);
      } catch (err) {
        console.error("Error loading property:", err);
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 404) {
        alert("Không tìm thấy đặt thuê");
        navigate("/my-bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (
      !window.confirm(
        "Bạn có chắc muốn hủy đặt thuê này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      const response = await cancelBooking(id);

      if (response?.success) {
        alert("Đã hủy đặt thuê thành công");
        loadBookingDetails(); // Reload to show updated status
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(
        error.response?.data?.message ||
          "Không thể hủy đặt thuê. Vui lòng thử lại."
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleContactOwner = async () => {
    if (!property?.owner?.ownerId) {
      alert("Thông tin chủ nhà không khả dụng");
      return;
    }

    try {
      setContactingOwner(true);

      const conversationData = {
        type: "DIRECT",
        participantIds: [property.owner.ownerId],
      };

      const response = await createConversation(conversationData);
      const conversation =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      navigate("/messages", {
        state: {
          conversationId: conversation.conversationId,
          propertyId: property.propertyId,
          propertyTitle: property.title,
          ownerId: property.owner.ownerId,
          ownerName: property.owner?.name || "Owner",
        },
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
    } finally {
      setContactingOwner(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING_APPROVAL: {
        label: "Chờ duyệt",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-5 h-5" />,
        description: "Đang chờ chủ nhà xác nhận yêu cầu đặt thuê của bạn",
      },
      ACTIVE: {
        label: "Đang thuê",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-5 h-5" />,
        description: "Hợp đồng thuê đang có hiệu lực",
      },
      PAUSED: {
        label: "Tạm dừng",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <AlertCircle className="w-5 h-5" />,
        description: "Hợp đồng thuê đang tạm dừng",
      },
      TERMINATED: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="w-5 h-5" />,
        description: "Đặt thuê đã bị hủy",
      },
      EXPIRED: {
        label: "Hết hạn",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <XCircle className="w-5 h-5" />,
        description: "Hợp đồng thuê đã hết hạn",
      },
      RENEWED: {
        label: "Đã gia hạn",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <RefreshCw className="w-5 h-5" />,
        description: "Hợp đồng đã được gia hạn",
      },
    };
    return statusMap[status] || statusMap.PENDING_APPROVAL;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = () => {
    if (!booking?.leaseStart || !booking?.leaseEnd)
      return { days: 0, months: 0 };

    const start = new Date(booking.leaseStart);
    const end = new Date(booking.leaseEnd);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const months = Math.ceil(days / 30);

    return { days, months };
  };

  const calculateTotalCost = () => {
    if (!booking) return 0;
    const { months } = calculateDuration();
    return booking.monthlyRent * months + (booking.rentalDeposit || 0);
  };

  const canCancelBooking = () => {
    return (
      booking?.status === "PENDING_APPROVAL" || booking?.status === "ACTIVE"
    );
  };

  const getDaysUntilStart = () => {
    if (!booking?.leaseStart) return null;
    const start = new Date(booking.leaseStart);
    const now = new Date();
    const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  const getDaysRemaining = () => {
    if (!booking?.leaseEnd || booking?.status !== "ACTIVE") return null;
    const end = new Date(booking.leaseEnd);
    const now = new Date();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Đang tải chi tiết...</span>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy đặt thuê
              </h2>
              <button
                onClick={() => navigate("/my-bookings")}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Quay lại danh sách
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const duration = calculateDuration();
  const totalCost = calculateTotalCost();
  const daysUntilStart = getDaysUntilStart();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
              onClick={() => navigate("/my-bookings")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách</span>
            </button>

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {booking.bookingReference ||
                      `Đặt thuê #${booking.id?.substring(0, 8)}`}
                  </h1>
                  <div className="text-sm text-gray-500 mb-4">
                    Đặt ngày: {formatDateTime(booking.createdAt)}
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusInfo.color}`}
                  >
                    {statusInfo.icon}
                    <div>
                      <div className="font-semibold">{statusInfo.label}</div>
                      <div className="text-xs opacity-75">
                        {statusInfo.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {canCancelBooking() && (
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="px-6 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {cancelling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang hủy...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Hủy đặt thuê</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/properties/${booking.propertyId}`)
                    }
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Xem nhà</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline Alert */}
            {daysUntilStart !== null && daysUntilStart > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Sắp bắt đầu</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Còn {daysUntilStart} ngày nữa đến ngày bắt đầu thuê
                  </p>
                </div>
              </div>
            )}

            {daysRemaining !== null && daysRemaining <= 30 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Sắp hết hạn</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Hợp đồng sẽ hết hạn sau {daysRemaining} ngày. Liên hệ chủ
                    nhà nếu muốn gia hạn.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Lease Period */}
                <Section title="Thời gian thuê">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<Calendar className="w-5 h-5" />}
                      label="Ngày bắt đầu"
                      value={formatDate(booking.leaseStart)}
                    />
                    <InfoCard
                      icon={<Calendar className="w-5 h-5" />}
                      label="Ngày kết thúc"
                      value={formatDate(booking.leaseEnd)}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Thời gian thuê:</span>
                      <span className="font-semibold text-lg">
                        {duration.months} tháng ({duration.days} ngày)
                      </span>
                    </div>
                  </div>
                </Section>

                {/* Payment Info */}
                <Section title="Thông tin thanh toán">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">
                        Tiền thuê mỗi tháng:
                      </span>
                      <span className="font-semibold text-lg">
                        {booking.monthlyRent?.toLocaleString()}đ
                      </span>
                    </div>

                    {booking.rentalDeposit > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Tiền cọc:</span>
                        <span className="font-semibold text-lg">
                          {booking.rentalDeposit?.toLocaleString()}đ
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-medium">
                          Tổng chi phí ước tính:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {totalCost.toLocaleString()}đ
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Bao gồm {duration.months} tháng tiền thuê và tiền cọc
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Property Info */}
                {property && (
                  <Section title="Thông tin nhà">
                    <div className="flex gap-4 mb-4">
                      {property.mediaList?.[0]?.url && (
                        <img
                          src={property.mediaList[0].url}
                          alt={property.title}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/128?text=No+Image";
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {property.title}
                        </h3>
                        <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            {property.address?.fullAddress ||
                              `${property.address?.district}, ${property.address?.province}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>{property.bedrooms} phòng ngủ</span>
                          <span>•</span>
                          <span>{property.bathrooms} phòng tắm</span>
                          <span>•</span>
                          <span>{property.size} m²</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/properties/${booking.propertyId}`)
                      }
                      className="w-full py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Xem chi tiết nhà
                    </button>
                  </Section>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Owner Contact */}
                {property?.owner && (
                  <Section title="Chủ nhà">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-500">Tên</div>
                          <div className="font-semibold">
                            {property.owner.name || "-"}
                          </div>
                        </div>
                      </div>

                      {property.owner.phone && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Điện thoại
                            </div>
                            <div className="font-semibold">
                              {property.owner.phone}
                            </div>
                          </div>
                        </div>
                      )}

                      {property.owner.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="font-semibold text-sm">
                              {property.owner.email}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleContactOwner}
                        disabled={contactingOwner}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {contactingOwner ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang kết nối...</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            <span>Nhắn tin với chủ nhà</span>
                          </>
                        )}
                      </button>
                    </div>
                  </Section>
                )}

                {/* Booking Details */}
                <Section title="Chi tiết đặt thuê">
                  <div className="space-y-2 text-sm">
                    <DetailRow
                      label="Mã đặt thuê"
                      value={booking.bookingReference || "-"}
                    />
                    <DetailRow label="ID đặt thuê" value={booking.id} />
                    <DetailRow label="ID nhà" value={booking.propertyId} />
                    <DetailRow
                      label="Ngày tạo"
                      value={formatDateTime(booking.createdAt)}
                    />
                    {booking.updatedAt && (
                      <DetailRow
                        label="Cập nhật lần cuối"
                        value={formatDateTime(booking.updatedAt)}
                      />
                    )}
                  </div>
                </Section>

                {/* Download */}
                <button
                  onClick={() => alert("Tính năng tải hợp đồng sẽ sớm ra mắt")}
                  className="w-full py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải hợp đồng PDF</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

// ========================================================
// SUB COMPONENTS
// ========================================================

const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
    <div className="text-blue-600 mt-1">{icon}</div>
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900 text-right max-w-[60%] break-words">
      {value || "-"}
    </span>
  </div>
);

export default BookingDetail;
