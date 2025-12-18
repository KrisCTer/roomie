import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  UserRound,
  Mail,
  Phone,
  CircleUserRound,
} from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/billDetailHelpers";

const BillDetailInfo = ({ bill, isOverdue, isPaid, tenant, landlord }) => {
  console.log("BillDetailInfo tenant:", tenant);
  console.log("BillDetailInfo landlord:", landlord);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Payment Information
      </h2>

      <div className="space-y-4 text-sm">
        {/* ===== BILL INFO ===== */}
        <div>
          <p className="text-gray-600 mb-1">Billing Month</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {formatDate(bill.billingMonth)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Due Date</p>
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
            <p className="text-gray-600 mb-1">Paid At</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">
                {formatDateTime(bill.paidAt)}
              </span>
            </div>
          </div>
        )}

        <div>
          <p className="text-gray-600 mb-1">Bill ID</p>
          <p className="font-mono text-gray-900 break-all">{bill.id}</p>
        </div>

        <div>
          <p className="text-gray-600 mb-1">Contract ID</p>
          <p className="font-mono text-gray-900 break-all">{bill.contractId}</p>
        </div>

        {/* ===== TENANT INFO ===== */}
        <div className="pt-4 border-t">
          <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CircleUserRound className="w-4 h-4" />
            Tenant
          </p>

          {tenant ? (
            <div className="space-y-1 text-gray-600">
              <p className="flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                {tenant.firstName} {tenant.lastName}
              </p>
              <p className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {tenant.email || "N/A"}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {tenant.phoneNumber || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 italic">Loading tenant information…</p>
          )}
        </div>

        {/* ===== LANDLORD INFO ===== */}
        <div className="pt-4 border-t">
          <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CircleUserRound className="w-4 h-4" />
            Landlord
          </p>

          {landlord ? (
            <div className="space-y-1 text-gray-600">
              <p className="flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                {landlord.firstName} {landlord.lastName}
              </p>
              <p className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {landlord.email || "N/A"}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {landlord.phoneNumber || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 italic">
              Loading landlord information…
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetailInfo;
