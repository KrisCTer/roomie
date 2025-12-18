import React from "react";
import { DollarSign, Calendar } from "lucide-react";

const PaymentTermsCard = ({
  property,
  contract,
  formatCurrency,
  formatDate,
}) => {
  if (!property || !contract) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-blue-600" />
        Payment Terms
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(property.monthlyRent)}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-gray-600 mb-1">Security Deposit</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(property.rentalDeposit)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Start Date</p>
          <p className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(contract.startDate)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">End Date</p>
          <p className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(contract.endDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTermsCard;
