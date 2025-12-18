import React from "react";
import { UserRound, Mail, Phone, CircleUserRound } from "lucide-react";

const ContractInfoCard = ({ contract, tenant, landlord, formatDateTime }) => {
  console.log("🏢 Contract Info:", contract);
  console.log("👤 Tenant Info:", tenant);
  console.log("👤 Landlord Info:", landlord);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Contract Information
      </h2>

      <div className="space-y-4 text-sm">
        {/* Contract basic info */}
        <div>
          <p className="text-gray-600">Contract ID</p>
          <p className="font-medium text-gray-900 font-mono">
            {contract._id || contract.id}
          </p>
        </div>

        <div>
          <p className="text-gray-600">Booking ID</p>
          <p className="font-medium text-gray-900 font-mono">
            {contract.bookingId || "N/A"}
          </p>
        </div>

        {/* Tenant Info */}
        <div className="pt-3 border-t">
          <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
            <CircleUserRound className="w-4 h-4" />
            Tenant
          </p>

          {tenant ? (
            <div className="space-y-1">
              <p className="text-gray-600 flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                {tenant.firstName} {tenant.lastName}
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {tenant.email || "N/A"}
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {tenant.phoneNumber || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 italic">Loading tenant information…</p>
          )}
        </div>

        {/* Landlord Info */}
        <div className="pt-3 border-t">
          <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
            <CircleUserRound className="w-4 h-4" />
            Landlord
          </p>

          {landlord ? (
            <div className="space-y-1">
              <p className="text-gray-600 flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                {landlord.firstName} {landlord.lastName}
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {landlord.email || "N/A"}
              </p>
              <p className="text-gray-600 flex items-center gap-1">
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

        {/* Dates */}
        <div className="pt-3 border-t">
          <p className="text-gray-600">Created At</p>
          <p className="font-medium text-gray-900">
            {formatDateTime(contract.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-gray-600">Last Updated</p>
          <p className="font-medium text-gray-900">
            {formatDateTime(contract.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractInfoCard;
