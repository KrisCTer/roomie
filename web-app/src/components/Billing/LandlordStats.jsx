import React from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import StatsCard from "./StatsCard";
import { formatCurrency } from "../../utils/billHelpers";

const LandlordStats = ({ stats }) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatsCard
          icon={FileText}
          label="Tổng hóa đơn"
          value={stats.total}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatsCard
          icon={FileText}
          label="Nháp"
          value={stats.draft}
          bgColor="bg-gray-100"
          textColor="text-gray-600"
        />
        <StatsCard
          icon={Clock}
          label="Chờ thanh toán"
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

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">Tổng doanh thu</p>
            <p className="text-4xl font-bold">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>
    </>
  );
};

export default LandlordStats;
