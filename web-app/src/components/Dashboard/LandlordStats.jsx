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
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Your Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Home}
            label="Total Properties"
            value={stats.totalProperties}
            color="blue"
            onClick={() => onStatClick?.("properties")}
          />
          <StatCard
            icon={Clock}
            label="Pending Approval"
            value={stats.pendingProperties}
            color="yellow"
            onClick={() => onStatClick?.("pending")}
          />
          <StatCard
            icon={CheckCircle}
            label="Currently Rented"
            value={stats.rentedProperties}
            color="green"
            onClick={() => onStatClick?.("rented")}
          />
          <StatCard
            icon={TrendingUp}
            label="Available for Rent"
            value={stats.availableProperties}
            color="indigo"
            onClick={() => onStatClick?.("available")}
          />
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={DollarSign}
            label="Monthly Income"
            value={`${stats.monthlyIncome.toLocaleString()}đ`}
            color="purple"
          />
          <StatCard
            icon={FileText}
            label="Unpaid Bills"
            value={stats.unpaidBills}
            color="red"
            onClick={() => onStatClick?.("unpaid-bills")}
          />
          <StatCard
            icon={CheckCircle}
            label="Paid Bills"
            value={stats.paidBills}
            color="green"
            onClick={() => onStatClick?.("paid-bills")}
          />
        </div>
      </div>

      {/* Contract Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contracts</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Contracts"
            value={stats.totalContracts}
            color="blue"
            onClick={() => onStatClick?.("contracts")}
          />
          <StatCard
            icon={CheckCircle}
            label="Active"
            value={stats.activeContracts}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Pending Signature"
            value={stats.pendingContracts}
            color="yellow"
          />
          <StatCard
            icon={AlertTriangle}
            label="Expired/Cancelled"
            value={stats.expiredContracts}
            color="red"
          />
        </div>
      </div>
    </div>
  );
};

export default LandlordStats;
