import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/billDetailHelpers";

const StatusBanner = ({ bill, isOverdue, isPaid }) => {
  if (isOverdue) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">
              HÓA ĐƠN QUÁ HẠN THANH TOÁN
            </h3>
            <p className="text-sm text-red-700">
              Hóa đơn đã quá hạn thanh toán từ ngày {formatDate(bill.dueDate)}.
              Vui lòng thanh toán ngay để tránh phát sinh phí phạt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 mb-1">
              ĐÃ THANH TOÁN THÀNH CÔNG
            </h3>
            <p className="text-sm text-green-700">
              Hóa đơn đã được thanh toán vào lúc {formatDateTime(bill.paidAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StatusBanner;
