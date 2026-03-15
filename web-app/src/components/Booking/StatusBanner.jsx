import React from "react";

const StatusBanner = ({ status, statusConfig, isOwner }) => {
  const getStatusMessage = () => {
    if (status === "PENDING_APPROVAL") {
      return isOwner
        ? "Vui lòng xem xét và xác nhận đặt chỗ này"
        : "Đang chờ xác nhận của chủ sở hữu";
    }
    if (status === "ACTIVE") {
      return "Hợp đồng thuê của bạn hiện đang có hiệu lực.";
    }
    if (status === "TERMINATED") {
      return "Đặt chỗ này đã bị chấm dứt";
    }
    if (status === "EXPIRED") {
      return "Hợp đồng thuê này đã hết hạn";
    }
    return "";
  };

  return (
    <div
      className={`${statusConfig.bg} text-white rounded-lg p-4 mb-6 flex items-center gap-3`}
    >
      {statusConfig.icon}
      <div>
        <div className="font-semibold">{statusConfig.text}</div>
        <div className="text-sm opacity-90">{getStatusMessage()}</div>
      </div>
    </div>
  );
};

export default StatusBanner;
