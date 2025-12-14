import React from "react";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/billDetailHelpers";

const BillDetailInfo = ({ bill, isOverdue, isPaid }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Thông tin thanh toán
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Tháng thanh toán</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {formatDate(bill.billingMonth)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Hạn thanh toán</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span
              className={`font-medium ${
                isOverdue ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatDate(bill.dueDate)}
            </span>
          </div>
        </div>

        {isPaid && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Đã thanh toán lúc</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">
                {formatDateTime(bill.paidAt)}
              </span>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-1">Mã hóa đơn</p>
          <p className="font-mono text-sm text-gray-900 break-all">{bill.id}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Mã hợp đồng</p>
          <p className="font-mono text-sm text-gray-900 break-all">
            {bill.contractId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillDetailInfo;
