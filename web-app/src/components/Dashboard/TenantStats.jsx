import React from "react";
import {
  Calendar,
  Clock as ClockIcon,
  CheckCircle as CheckIcon,
  FileText as FileIcon,
  DollarSign as Dollar,
  TrendingUp as Trending,
} from "lucide-react";
import StatCard from "../../components/Dashboard/StatCard";

const TenantStats = ({ stats, onStatClick }) => {
  return (
    <div className="space-y-6">
      {/* Booking Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Đặt thuê của bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={CheckIcon}
            label="Đang thuê"
            value={stats.activeBookings}
            color="green"
            onClick={() => onStatClick?.("active-bookings")}
          />
          <StatCard
            icon={ClockIcon}
            label="Chờ xác nhận"
            value={stats.pendingBookings}
            color="yellow"
            onClick={() => onStatClick?.("pending-bookings")}
          />
          <StatCard
            icon={CheckIcon}
            label="Đã hoàn thành"
            value={stats.completedBookings}
            color="blue"
            onClick={() => onStatClick?.("completed-bookings")}
          />
        </div>
      </div>

      {/* Contract Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Hợp đồng thuê</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileIcon}
            label="Tổng hợp đồng"
            value={stats.totalContracts}
            color="blue"
            onClick={() => onStatClick?.("contracts")}
          />
          <StatCard
            icon={CheckIcon}
            label="Đang hiệu lực"
            value={stats.activeContracts}
            color="green"
          />
          <StatCard
            icon={ClockIcon}
            label="Chờ ký"
            value={stats.pendingContracts}
            color="yellow"
          />
          <StatCard
            icon={Calendar}
            label="Hết hạn/Hủy"
            value={stats.expiredContracts}
            color="red"
          />
        </div>
      </div>

      {/* Bill Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Hóa đơn & Thanh toán
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Dollar}
            label="Tổng số tiền"
            value={`${stats.totalBillAmount.toLocaleString()}đ`}
            color="purple"
          />
          <StatCard
            icon={ClockIcon}
            label="Chưa thanh toán"
            value={stats.unpaidBills}
            color="red"
            onClick={() => onStatClick?.("unpaid-bills")}
          />
          <StatCard
            icon={CheckIcon}
            label="Đã thanh toán"
            value={stats.paidBills}
            color="green"
            onClick={() => onStatClick?.("paid-bills")}
          />
        </div>
      </div>
    </div>
  );
};
export default TenantStats;
