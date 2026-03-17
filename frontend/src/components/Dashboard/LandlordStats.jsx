/* aria-label */
import React from "react";
import { Home, Clock, CheckCircle, DollarSign, FileText } from "lucide-react";
import StatCard from "../../components/Dashboard/StatCard";

const LandlordStats = ({ stats, onStatClick }) => {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        KPI vận hành chính
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Home}
          label="Bất động sản"
          value={stats.totalProperties}
          color="blue"
          onClick={() => onStatClick?.("properties")}
        />
        <StatCard
          icon={Clock}
          label="Chờ phê duyệt"
          value={stats.pendingProperties}
          color="yellow"
          onClick={() => onStatClick?.("pending")}
        />
        <StatCard
          icon={CheckCircle}
          label="Hợp đồng hoạt động"
          value={stats.activeContracts}
          color="green"
          onClick={() => onStatClick?.("contracts")}
        />
        <StatCard
          icon={FileText}
          label="Hóa đơn chưa thanh toán"
          value={stats.unpaidBills}
          color="red"
          onClick={() => onStatClick?.("unpaid-bills")}
        />
        <StatCard
          icon={DollarSign}
          label="Doanh thu tháng"
          value={`${stats.monthlyIncome.toLocaleString()}đ`}
          color="teal"
        />
      </div>
    </div>
  );
};

export default LandlordStats;
