import React from "react";
import { Shield, CheckCircle, Clock } from "lucide-react";

const SignatureStatusCard = ({ contract }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        Signature Status
      </h2>

      <div className="space-y-4">
        {/* Landlord */}
        <div
          className={`p-4 rounded-lg border-2 ${
            contract.landlordSigned
              ? "bg-green-50 border-green-300"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">Landlord</span>
            {contract.landlordSigned ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p
            className={`text-sm ${
              contract.landlordSigned ? "text-green-700" : "text-gray-600"
            }`}
          >
            {contract.landlordSigned ? "✓ Signed" : "Not signed yet"}
          </p>
        </div>

        {/* Tenant */}
        <div
          className={`p-4 rounded-lg border-2 ${
            contract.tenantSigned
              ? "bg-green-50 border-green-300"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">Tenant</span>
            {contract.tenantSigned ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p
            className={`text-sm ${
              contract.tenantSigned ? "text-green-700" : "text-gray-600"
            }`}
          >
            {contract.tenantSigned ? "✓ Signed" : "Not signed yet"}
          </p>
        </div>

        {/* Both signed */}
        {contract.landlordSigned && contract.tenantSigned && (
          <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                Both parties have signed the contract
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureStatusCard;
