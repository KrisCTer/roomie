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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Bookings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={CheckIcon}
            label="Currently Renting"
            value={stats.activeBookings}
            color="green"
            onClick={() => onStatClick?.("active-bookings")}
          />
          <StatCard
            icon={ClockIcon}
            label="Pending Confirmation"
            value={stats.pendingBookings}
            color="yellow"
            onClick={() => onStatClick?.("pending-bookings")}
          />
          <StatCard
            icon={CheckIcon}
            label="Completed"
            value={stats.completedBookings}
            color="blue"
            onClick={() => onStatClick?.("completed-bookings")}
          />
        </div>
      </div>

      {/* Contract Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Rental Contracts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FileIcon}
            label="Total Contracts"
            value={stats.totalContracts}
            color="blue"
            onClick={() => onStatClick?.("contracts")}
          />
          <StatCard
            icon={CheckIcon}
            label="Active"
            value={stats.activeContracts}
            color="green"
          />
          <StatCard
            icon={ClockIcon}
            label="Pending Signature"
            value={stats.pendingContracts}
            color="yellow"
          />
          <StatCard
            icon={Calendar}
            label="Expired/Cancelled"
            value={stats.expiredContracts}
            color="red"
          />
        </div>
      </div>

      {/* Bill Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Bills & Payments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Dollar}
            label="Total Amount"
            value={`${stats.totalBillAmount.toLocaleString()}đ`}
            color="purple"
          />
          <StatCard
            icon={ClockIcon}
            label="Unpaid"
            value={stats.unpaidBills}
            color="red"
            onClick={() => onStatClick?.("unpaid-bills")}
          />
          <StatCard
            icon={CheckIcon}
            label="Paid"
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
