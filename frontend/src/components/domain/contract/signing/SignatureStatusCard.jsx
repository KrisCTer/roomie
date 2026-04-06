/* aria-label */
import React from "react";
import { Shield, CheckCircle, Clock } from "lucide-react";

const SignatureStatusCard = ({ contract }) => {
  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-[#CC6F4A]" />
        Trạng thái chữ ký
      </h2>

      <div className="space-y-4">
        {/* Landlord */}
        <div
          className={`p-4 rounded-lg border-2 ${
            contract.landlordSigned
              ? "bg-emerald-500/10 border-emerald-500/35"
              : "bg-white/55 border-white/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#2B2A28]">Chủ nhà</span>
            {contract.landlordSigned ? (
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            ) : (
              <Clock className="w-6 h-6 text-[#9C958B]" />
            )}
          </div>
          <p
            className={`text-sm ${
              contract.landlordSigned ? "text-emerald-700" : "text-[#6E675F]"
            }`}
          >
            {contract.landlordSigned ? "Đã ký" : "Chưa ký"}
          </p>
        </div>

        {/* Tenant */}
        <div
          className={`p-4 rounded-lg border-2 ${
            contract.tenantSigned
              ? "bg-emerald-500/10 border-emerald-500/35"
              : "bg-white/55 border-white/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#2B2A28]">Người thuê</span>
            {contract.tenantSigned ? (
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            ) : (
              <Clock className="w-6 h-6 text-[#9C958B]" />
            )}
          </div>
          <p
            className={`text-sm ${
              contract.tenantSigned ? "text-emerald-700" : "text-[#6E675F]"
            }`}
          >
            {contract.tenantSigned ? "Đã ký" : "Chưa ký"}
          </p>
        </div>

        {/* Both signed */}
        {contract.landlordSigned && contract.tenantSigned && (
          <div className="p-4 bg-emerald-500/12 border border-emerald-500/35 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Cả hai bên đã ký hợp đồng</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureStatusCard;
