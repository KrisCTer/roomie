import React from "react";
import { FileText, Zap, Droplet, Wifi, Car, Wrench } from "lucide-react";
import { formatCurrency } from "../../utils/billDetailHelpers";

const BillBreakdown = ({ bill }) => {
  const BillItem = ({
    icon: Icon,
    label,
    amount,
    iconColor,
    iconBg,
    details,
  }) => {
    return (
      <div className="border-t pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              {details && <p className="text-xs text-gray-600">{details}</p>}
            </div>
          </div>
          <span className="font-bold text-gray-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Bill Breakdown</h2>

      <div className="space-y-4">
        {/* Rent */}
        <BillItem
          icon={FileText}
          label="Monthly Rent"
          amount={bill.monthlyRent}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />

        {/* Electricity */}
        <BillItem
          icon={Zap}
          label="Electricity"
          amount={bill.electricityAmount}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
          details={`${bill.electricityOld} → ${bill.electricityNew} kWh (${
            bill.electricityConsumption
          } kWh × ${formatCurrency(bill.electricityUnitPrice)})`}
        />

        {/* Water */}
        <BillItem
          icon={Droplet}
          label="Water"
          amount={bill.waterAmount}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          details={`${bill.waterOld} → ${bill.waterNew} m³ (${
            bill.waterConsumption
          } m³ × ${formatCurrency(bill.waterUnitPrice)})`}
        />

        {/* Internet */}
        {bill.internetPrice > 0 && (
          <BillItem
            icon={Wifi}
            label="Internet"
            amount={bill.internetPrice}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        )}

        {/* Parking */}
        {bill.parkingPrice > 0 && (
          <BillItem
            icon={Car}
            label="Parking"
            amount={bill.parkingPrice}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
        )}

        {/* Cleaning */}
        {bill.cleaningPrice > 0 && (
          <BillItem
            icon={FileText}
            label="Cleaning Service"
            amount={bill.cleaningPrice}
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        )}

        {/* Maintenance */}
        {bill.maintenancePrice > 0 && (
          <BillItem
            icon={Wrench}
            label="Maintenance"
            amount={bill.maintenancePrice}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
        )}

        {/* Other */}
        {bill.otherPrice > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Other Fees</p>
                <p className="text-sm text-gray-600">{bill.otherDescription}</p>
              </div>
              <span className="font-bold text-gray-900">
                {formatCurrency(bill.otherPrice)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">TOTAL</span>
          <span className="text-3xl font-bold text-blue-600">
            {formatCurrency(bill.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BillBreakdown;
