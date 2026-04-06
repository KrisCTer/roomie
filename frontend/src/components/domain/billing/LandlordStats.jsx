/* aria-label */
import React from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import StatsCard from "./StatsCard";
import { formatCurrency } from "../../../utils/billHelpers";

const LandlordStats = ({ stats }) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          icon={FileText}
          label="Tổng hóa đơn"
          value={stats.total}
          color="blue"
        />
        <StatsCard
          icon={FileText}
          label="Bản nháp"
          value={stats.draft}
          color="gray"
        />
        <StatsCard
          icon={Clock}
          label="Đang chờ thanh toán"
          value={stats.pending}
          color="yellow"
        />
        <StatsCard
          icon={CheckCircle}
          label="Đã thanh toán"
          value={stats.paid}
          color="green"
        />
        <StatsCard
          icon={AlertCircle}
          label="Quá hạn"
          value={stats.overdue}
          color="red"
        />
      </div>

      {/* Revenue Banner */}
      <div
        className="apple-glass-panel rounded-2xl p-6 mt-5"
        style={{
          background: "linear-gradient(135deg, #d89a5b 0%, #b8682f 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 mb-2">Tổng doanh thu</p>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </>
  );
};

export default LandlordStats;
