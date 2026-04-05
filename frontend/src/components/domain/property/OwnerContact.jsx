import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MessageCircle, Loader2, Shield } from "lucide-react";

const OwnerContact = ({
  owner,
  contactingOwner,
  onContactOwner,
  isFavorite,
  onToggleFavorite,
  loading,
  onContact,
}) => {
  const navigate = useNavigate();
  const isContacting = contactingOwner || loading;
  const handleContact = onContactOwner || onContact;

  if (!owner) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Thông tin chủ nhà không khả dụng
        </p>
      </div>
    );
  }

  const handleViewProfile = () => {
    navigate(`/user/${owner.ownerId}`);
  };

  return (
    <div className="rounded-2xl border border-[#ECDCC8] bg-[#FFFBF6] p-6 shadow-[0_14px_36px_rgba(17,24,39,0.08)]">
      {/* Owner Info Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#F0E5D8]">
        <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-[#F4E4D0]">
          {owner.name?.[0]?.toUpperCase() || "O"}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A3412]">
            Người cho thuê
          </p>
          <h3 className="font-bold text-lg text-gray-900">{owner.name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Tài khoản đã xác minh
          </p>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="space-y-3">
        {owner.phoneNumber ? (
          <a
            href={`tel:${owner.phoneNumber}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#111827] text-white rounded-xl hover:bg-black transition-colors shadow-sm font-semibold"
          >
            <Phone className="w-5 h-5" />
            <span>Liên hệ ngay</span>
          </a>
        ) : (
          <button
            onClick={handleViewProfile}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#111827] text-white rounded-xl hover:bg-black transition-colors shadow-sm font-semibold"
          >
            <Shield className="w-5 h-5" />
            <span>Liên hệ ngay</span>
          </button>
        )}

        {/* Message Owner */}
        <button
          onClick={handleContact}
          disabled={isContacting}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#CC6F4A] text-white rounded-xl hover:bg-[#b7603f] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isContacting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang kết nối...</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              <span>Nhắn tin</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EFE3D4]"></div>
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
      <div className="mt-6 p-4 bg-[#FFF4ED] border border-[#F5D9C4] rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#7C2D12] mb-1">
              Lưu ý an toàn
            </p>
            <p className="text-xs text-[#9A3412]">
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
