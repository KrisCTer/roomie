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

const TenantStats = ({ stats }) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={FileText}
          label="Total Bills"
          value={stats.total}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatsCard
          icon={Clock}
          label="Pending Payment"
          value={stats.pending}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatsCard
          icon={CheckCircle}
          label="Paid"
          value={stats.paid}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatsCard
          icon={AlertCircle}
          label="Overdue"
          value={stats.overdue}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      {/* Pending Payment Banner */}
      {stats.totalPending > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-2">Total Amount Due</p>
              <p className="text-4xl font-bold">
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantStats;
