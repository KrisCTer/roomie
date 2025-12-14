import React from "react";

const StatusBanner = ({ status, statusConfig, isOwner }) => {
  const getStatusMessage = () => {
    if (status === "PENDING_APPROVAL") {
      return isOwner
        ? "Please review and confirm this booking"
        : "Waiting for owner's confirmation";
    }
    if (status === "ACTIVE") {
      return "Your lease is currently active";
    }
    if (status === "TERMINATED") {
      return "This booking has been terminated";
    }
    if (status === "EXPIRED") {
      return "This lease has expired";
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
