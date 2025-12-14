import React from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  PenTool,
  FileText,
} from "lucide-react";

const ContractCard = ({ contract, role, onClick, propertyData, userData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        label: "Đang hiệu lực",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600",
      },
      PENDING_SIGNATURE: {
        label: "Chờ ký",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: Clock,
        iconColor: "text-yellow-600",
      },
      PENDING_PAYMENT: {
        label: "Chờ thanh toán",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: Clock,
        iconColor: "text-blue-600",
      },
      EXPIRED: {
        label: "Đã hết hạn",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: AlertCircle,
        iconColor: "text-gray-600",
      },
      TERMINATED: {
        label: "Đã chấm dứt",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: AlertCircle,
        iconColor: "text-red-600",
      },
      PAUSED: {
        label: "Tạm dừng",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        icon: AlertCircle,
        iconColor: "text-orange-600",
      },
      DRAFT: {
        label: "Bản nháp",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: FileText,
        iconColor: "text-gray-600",
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  const propertyTitle = propertyData?.title || "Đang tải...";
  const propertyAddress = propertyData?.address?.fullAddress || "Đang tải...";
  const monthlyRent = propertyData?.monthlyRent || 0;
  const rentalDeposit = propertyData?.rentalDeposit || 0;

  const otherPartyId =
    role === "landlord" ? contract.tenantId : contract.landlordId;
  const otherPartyData = userData[otherPartyId];
  const otherPartyName = otherPartyData
    ? `${otherPartyData.firstName || ""} ${
        otherPartyData.lastName || ""
      }`.trim() || "N/A"
    : "Đang tải...";
  const otherPartyPhone = otherPartyData?.phoneNumber || "N/A";

  const isSigned =
    role === "landlord" ? contract.landlordSigned : contract.tenantSigned;
  const otherPartySigned =
    role === "landlord" ? contract.tenantSigned : contract.landlordSigned;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{propertyTitle}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">{propertyAddress}</p>
          <p className="text-xs text-gray-500">Mã HĐ: {contract.id}</p>
        </div>

        <span
          className={`${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0`}
        >
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            {role === "landlord" ? "Người thuê" : "Chủ nhà"}
          </p>
          <p className="text-sm font-medium text-gray-900">{otherPartyName}</p>
          <p className="text-xs text-gray-600">{otherPartyPhone}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Giá thuê</p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(monthlyRent)}
            <span className="text-xs font-normal text-gray-600">/tháng</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Tiền cọc</p>
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(rentalDeposit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Thời hạn</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(contract.startDate)}
          </p>
          <p className="text-xs text-gray-600">
            đến {formatDate(contract.endDate)}
          </p>
        </div>
      </div>

      {/* Footer - Signature Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div
            className={`flex items-center gap-1.5 ${
              isSigned ? "text-green-600" : "text-gray-400"
            }`}
          >
            {isSigned ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="font-medium">
              {role === "landlord" ? "Chủ nhà" : "Người thuê"}:{" "}
              {isSigned ? "Đã ký" : "Chưa ký"}
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              otherPartySigned ? "text-green-600" : "text-gray-400"
            }`}
          >
            {otherPartySigned ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="font-medium">
              {role === "landlord" ? "Người thuê" : "Chủ nhà"}:{" "}
              {otherPartySigned ? "Đã ký" : "Chưa ký"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contract.status === "PENDING_SIGNATURE" && !isSigned ? (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Ký ngay
            </button>
          ) : (
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
