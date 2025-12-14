import React from "react";
import { Calendar } from "lucide-react";

const LeasePeriodSection = ({ leaseStart, leaseEnd, formatDate }) => {
  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        Lease Period
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Start Date</div>
          <div className="font-semibold text-lg">
            {formatDate(leaseStart)}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">End Date</div>
          <div className="font-semibold text-lg">
            {formatDate(leaseEnd)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeasePeriodSection;