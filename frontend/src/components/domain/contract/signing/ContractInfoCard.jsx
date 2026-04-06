/* aria-label */
import React from "react";
import {
  UserRound,
  Mail,
  Phone,
  CircleUserRound,
  FileText,
  Clock3,
  Bookmark,
} from "lucide-react";

const ContractInfoCard = ({ contract, tenant, landlord, formatDateTime }) => {
  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4">
        Thông tin hợp đồng
      </h2>

      <div className="space-y-4 text-sm">
        {/* Contract basic info */}
        <div className="rounded-xl border border-white/70 bg-white/45 p-3">
          <p className="text-[#6E675F] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#CC6F4A]" /> Mã hợp đồng
          </p>
          <p className="font-medium text-[#2B2A28] font-mono break-all">
            {contract._id || contract.id}
          </p>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/45 p-3">
          <p className="text-[#6E675F] flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#CC6F4A]" /> Mã đặt phòng
          </p>
          <p className="font-medium text-[#2B2A28] font-mono break-all">
            {contract.bookingId || "N/A"}
          </p>
        </div>

        {/* Tenant Info */}
        <div className="pt-3 border-t border-white/45">
          <p className="text-[#3C3935] font-semibold mb-2 flex items-center gap-2">
            <CircleUserRound className="w-4 h-4 text-[#CC6F4A]" />
            Người thuê
          </p>

          {tenant ? (
            <div className="space-y-1 rounded-xl border border-white/70 bg-white/45 p-3">
              <p className="text-[#6E675F] flex items-center gap-1">
                <UserRound className="w-4 h-4 text-[#CC6F4A]" />
                {tenant.firstName} {tenant.lastName}
              </p>
              <p className="text-[#6E675F] flex items-center gap-1">
                <Mail className="w-4 h-4 text-[#CC6F4A]" />
                {tenant.email || "N/A"}
              </p>
              <p className="text-[#6E675F] flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#CC6F4A]" />
                {tenant.phoneNumber || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-[#9C958B] italic">Loading tenant information…</p>
          )}
        </div>

        {/* Landlord Info */}
        <div className="pt-3 border-t border-white/45">
          <p className="text-[#3C3935] font-semibold mb-2 flex items-center gap-2">
            <CircleUserRound className="w-4 h-4 text-[#CC6F4A]" />
            Chủ nhà
          </p>

          {landlord ? (
            <div className="space-y-1 rounded-xl border border-white/70 bg-white/45 p-3">
              <p className="text-[#6E675F] flex items-center gap-1">
                <UserRound className="w-4 h-4 text-[#CC6F4A]" />
                {landlord.firstName} {landlord.lastName}
              </p>
              <p className="text-[#6E675F] flex items-center gap-1">
                <Mail className="w-4 h-4 text-[#CC6F4A]" />
                {landlord.email || "N/A"}
              </p>
              <p className="text-[#6E675F] flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#CC6F4A]" />
                {landlord.phoneNumber || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-[#9C958B] italic">
              Loading landlord information…
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="pt-3 border-t border-white/45 rounded-xl border bg-white/45 p-3">
          <p className="text-[#6E675F] flex items-center gap-1.5">
            <Clock3 className="w-4 h-4 text-[#CC6F4A]" /> Ngày tạo
          </p>
          <p className="font-medium text-[#2B2A28]">
            {formatDateTime(contract.createdAt)}
          </p>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/45 p-3">
          <p className="text-[#6E675F] flex items-center gap-1.5">
            <Clock3 className="w-4 h-4 text-[#CC6F4A]" /> Cập nhật lần cuối
          </p>
          <p className="font-medium text-[#2B2A28]">
            {formatDateTime(contract.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractInfoCard;
