import React from "react";
import { DollarSign } from "lucide-react";

const FinancialDetailsSection = ({ booking, calculateTotalCost }) => {
  return (
    <div className="mb-6 pb-6 border-b">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-blue-600" />
        Financial Details
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Rent:</span>
          <span className="font-semibold text-lg">
            {booking.monthlyRent?.toLocaleString()} VND
          </span>
        </div>
        {booking.rentalDeposit > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rental Deposit:</span>
            <span className="font-semibold text-lg">
              {booking.rentalDeposit?.toLocaleString()} VND
            </span>
          </div>
        )}
        <div className="pt-3 border-t flex justify-between items-center">
          <span className="font-semibold text-gray-900">
            Total Estimated Cost:
          </span>
          <span className="font-bold text-2xl text-blue-600">
            {calculateTotalCost().toLocaleString()} VND
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetailsSection;
