/* aria-label */
import React from "react";
import { DollarSign, Calendar, Wallet, Landmark } from "lucide-react";

const PaymentTermsCard = ({
  property,
  contract,
  formatCurrency,
  formatDate,
}) => {
  if (!property || !contract) return null;

  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-[#CC6F4A]" />
        Điều khoản thanh toán
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/55 rounded-xl border border-white/70">
          <p className="text-sm text-[#6E675F] mb-1 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-[#CC6F4A]" />
            Tiền thuê hàng tháng
          </p>
          <p className="text-2xl font-bold text-[#CC6F4A]">
            {formatCurrency(property.monthlyRent)}
          </p>
        </div>

        <div className="p-4 bg-white/55 rounded-xl border border-white/70">
          <p className="text-sm text-[#6E675F] mb-1 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-[#CC6F4A]" />
            Tiền đặt cọc
          </p>
          <p className="text-2xl font-bold text-[#2B2A28]">
            {formatCurrency(property.rentalDeposit)}
          </p>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/45 p-3">
          <p className="text-sm text-[#6E675F]">Ngày bắt đầu</p>
          <p className="font-medium text-[#2B2A28] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#CC6F4A]" />
            {formatDate(contract.startDate)}
          </p>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/45 p-3">
          <p className="text-sm text-[#6E675F]">Ngày kết thúc</p>
          <p className="font-medium text-[#2B2A28] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#CC6F4A]" />
            {formatDate(contract.endDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTermsCard;
