import React from "react";
import { Home, Calendar, Clock, CreditCard } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusConfig,
} from "../../utils/billHelpers";

const TenantBillCards = ({ bills, properties, contracts, onView, onPay }) => {
  const getPropertyForBill = (bill) => {
    const contract = contracts.find((c) => c.id === bill.contractId);
    if (!contract) return null;
    return properties.find((p) => p.propertyId === contract.propertyId);
  };

  return (
    <div className="divide-y">
      {bills.map((bill) => {
        const statusConfig = getStatusConfig(bill.status);
        const isOverdue = bill.status === "OVERDUE";
        const isPending = bill.status === "PENDING";
        const canPay = isPending || isOverdue;
        const property = getPropertyForBill(bill);

        return (
          <div
            key={bill.id}
            className="p-6 hover:bg-gray-50 transition cursor-pointer"
            onClick={() => onView(bill)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Status Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>

                  {isOverdue && (
                    <span className="text-xs text-red-600 font-medium">
                      ⚠️ Vui lòng thanh toán ngay
                    </span>
                  )}
                </div>

                {/* Property Info */}
                {property && (
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {property.title}
                    </p>
                  </div>
                )}

                {/* Bill ID */}
                <p className="font-mono text-sm text-gray-600 mb-2">
                  Mã HĐ: {bill.id?.substring(0, 16)}...
                </p>

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Tháng: {formatDate(bill.billingMonth)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span
                      className={isOverdue ? "text-red-600 font-medium" : ""}
                    >
                      Hạn: {formatDate(bill.dueDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount & Pay Button */}
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Số tiền</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(bill.totalAmount)}
                </p>

                {canPay && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPay(bill);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Thanh toán
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TenantBillCards;
