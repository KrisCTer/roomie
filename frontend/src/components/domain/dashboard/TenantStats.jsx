/* aria-label */
import React from "react";
import {
  Clock as ClockIcon,
  CheckCircle as CheckIcon,
  FileText as FileIcon,
  DollarSign as Dollar,
} from "lucide-react";
import StatCard from "./StatCard";

const TenantStats = ({ stats, onStatClick }) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={CheckIcon}
          label="Đang thuê"
          value={stats.activeBookings}
          color="green"
          onClick={() => onStatClick?.("active-bookings")}
        />
        <StatCard
          icon={ClockIcon}
          label="Booking chờ xác nhận"
          value={stats.pendingBookings}
          color="yellow"
          onClick={() => onStatClick?.("pending-bookings")}
        />
        <StatCard
          icon={FileIcon}
          label="Hợp đồng hoạt động"
          value={stats.activeContracts}
          color="blue"
          onClick={() => onStatClick?.("contracts")}
        />
        <StatCard
          icon={ClockIcon}
          label="Hóa đơn chưa thanh toán"
          value={stats.unpaidBills}
          color="red"
          onClick={() => onStatClick?.("unpaid-bills")}
        />
        <StatCard
          icon={Dollar}
          label="Tổng số tiền hóa đơn"
          value={`${stats.totalBillAmount.toLocaleString()}đ`}
          color="teal"
        />
      </div>
    </div>
  );
};

export default TenantStats;
