// src/components/Billing/BillHistoryList.jsx
import React from "react";
import { Calendar, DollarSign, Eye, Edit, Send, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusConfig,
} from "../../utils/billHelpers";

/**
 * BillHistoryList Component
 * Displays a chronological list of bills for a property
 */
const BillHistoryList = ({ bills, onView, onEdit, onSend, onDelete }) => {
  if (bills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có hóa đơn nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bills.map((bill) => {
        const statusConfig = getStatusConfig(bill.status);

        return (
          <div
            key={bill.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              {/* Left: Bill Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {bill.id.substring(0, 12)}...
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Tháng: {formatDate(bill.billingMonth)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(bill.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(bill)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Xem chi tiết"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {bill.status === "DRAFT" && (
                  <>
                    <button
                      onClick={() => onEdit(bill)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSend(bill.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Gửi hóa đơn"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BillHistoryList;
