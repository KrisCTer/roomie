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

const TenantStats = ({ stats }) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={FileText}
          label="Tổng hóa đơn"
          value={stats.total}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatsCard
          icon={Clock}
          label="Đang chờ thanh toán"
          value={stats.pending}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatsCard
          icon={CheckCircle}
          label="Đã thanh toán"
          value={stats.paid}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatsCard
          icon={AlertCircle}
          label="Quá hạn"
          value={stats.overdue}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      {/* Pending Payment Banner */}
      {stats.totalPending > 0 && (
        <div className="apple-glass-panel rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, #e8845a 0%, #cc5533 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 mb-2">Tổng số tiền phải trả</p>
              <p className="text-4xl font-bold text-white">
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantStats;


