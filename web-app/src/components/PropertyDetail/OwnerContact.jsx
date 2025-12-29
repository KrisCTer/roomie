import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MessageCircle,
  User,
  Loader2,
  Shield,
} from "lucide-react";

const OwnerContact = ({
  owner,
  contactingOwner,
  onContactOwner,
  isFavorite,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  if (!owner) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Thông tin chủ nhà không khả dụng
        </p>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Roomie Property",
          text: "Xem phòng trọ này!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép liên kết!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleViewProfile = () => {
    navigate(`/user/${owner.ownerId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Owner Info Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {owner.name?.[0]?.toUpperCase() || "O"}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{owner.name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Chủ nhà
          </p>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="space-y-3">
        {/* View Profile */}
        <button
          onClick={handleViewProfile}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium"
        >
          <User className="w-5 h-5" />
          <span>Xem trang cá nhân</span>
        </button>

        {/* Message Owner */}
        <button
          onClick={onContactOwner}
          disabled={contactingOwner}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {contactingOwner ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang kết nối...</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              <span>Nhắn tin cho chủ nhà</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-500">
              Hoặc liên hệ trực tiếp
            </span>
          </div>
        </div>

        {/* Phone */}
        {owner.phoneNumber && (
          <a
            href={`tel:${owner.phoneNumber}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Phone className="w-5 h-5 text-green-600" />
            <span>{owner.phoneNumber}</span>
          </a>
        )}

        {/* Email */}
        {owner.email && (
          <a
            href={`mailto:${owner.email}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm break-all"
          >
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{owner.email}</span>
          </a>
        )}
      </div>

      {/* Safety Warning */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-900 mb-1">
              Lưu ý an toàn
            </p>
            <p className="text-xs text-red-800">
              Không chuyển tiền trước khi xem phòng trực tiếp và ký hợp đồng
              chính thức. Hãy cẩn trọng với các yêu cầu chuyển tiền đáng ngờ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerContact;
