import React from "react";
import {
  Home,
  Clock,
  CheckCircle,
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import StatCard from "../../components/Dashboard/StatCard";

const LandlordStats = ({ stats, onStatClick }) => {
  return (
    <div className="space-y-6">
      {/* Property Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Bất động sản của bạn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Home}
            label="Tổng số bất động sản"
            value={stats.totalProperties}
            color="blue"
            onClick={() => onStatClick?.("properties")}
          />
          <StatCard
            icon={Clock}
            label="Chờ duyệt"
            value={stats.pendingProperties}
            color="yellow"
            onClick={() => onStatClick?.("pending")}
          />
          <StatCard
            icon={CheckCircle}
            label="Đang cho thuê"
            value={stats.rentedProperties}
            color="green"
            onClick={() => onStatClick?.("rented")}
          />
          <StatCard
            icon={TrendingUp}
            label="Sẵn sàng cho thuê"
            value={stats.availableProperties}
            color="indigo"
            onClick={() => onStatClick?.("available")}
          />
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Doanh thu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={DollarSign}
            label="Thu nhập hàng tháng"
            value={`${stats.monthlyIncome.toLocaleString()}đ`}
            color="purple"
          />
          <StatCard
            icon={FileText}
            label="Hóa đơn chưa thanh toán"
            value={stats.unpaidBills}
            color="red"
            onClick={() => onStatClick?.("unpaid-bills")}
          />
          <StatCard
            icon={CheckCircle}
            label="Hóa đơn đã thanh toán"
            value={stats.paidBills}
            color="green"
            onClick={() => onStatClick?.("paid-bills")}
          />
        </div>
      </div>

      {/* Contract Stats */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Hợp đồng</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Tổng hợp đồng"
            value={stats.totalContracts}
            color="blue"
            onClick={() => onStatClick?.("contracts")}
          />
          <StatCard
            icon={CheckCircle}
            label="Đang hiệu lực"
            value={stats.activeContracts}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Chờ ký"
            value={stats.pendingContracts}
            color="yellow"
          />
          <StatCard
            icon={AlertTriangle}
            label="Hết hạn/Hủy"
            value={stats.expiredContracts}
            color="red"
          />
        </div>
      </div>
    </div>
  );
};
export default LandlordStats;
