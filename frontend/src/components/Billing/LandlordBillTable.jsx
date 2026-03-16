import React from "react";
import { Home, User, Eye, Edit, Send, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusConfig,
} from "../../utils/billHelpers";

const LandlordBillTable = ({
  bills,
  properties,
  contracts,
  tenants,
  onView,
  onEdit,
  onSend,
  onDelete,
}) => {
  const getPropertyForBill = (bill) => {
    const contract = contracts.find((c) => c.id === bill.contractId);
    if (!contract) return null;
    return properties.find((p) => p.propertyId === contract.propertyId);
  };

  const getTenantForBill = (bill) => {
    const contract = contracts.find((c) => c.id === bill.contractId);
    if (!contract) return null;
    return tenants[contract.tenantId];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Property
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tenant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Month
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {bills.map((bill) => {
            const statusConfig = getStatusConfig(bill.status);
            const property = getPropertyForBill(bill);
            const tenant = getTenantForBill(bill);

            return (
              <tr key={bill.id} className="hover:bg-gray-50 transition">
                {/* Property */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {property?.title || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {property?.address?.district || ""}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Tenant */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {tenant
                          ? `${tenant.firstName} ${tenant.lastName}`
                          : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tenant?.phoneNumber || ""}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Month */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(bill.billingMonth)}
                </td>

                {/* Due Date */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(bill.dueDate)}
                </td>

                {/* Amount */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(bill)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {bill.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => onEdit(bill)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSend(bill.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Send bill"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(bill.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LandlordBillTable;
