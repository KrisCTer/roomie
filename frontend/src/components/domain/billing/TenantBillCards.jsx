/* aria-label */
import React from "react";
import { AlertTriangle, Calendar, Clock, FileText, MapPin } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusConfig,
} from "../../../utils/billHelpers";

const TenantBillCards = ({ bills, properties, contracts, onView, onPay }) => {
  const getPropertyForBill = (bill) => {
    const contract = contracts.find((c) => c.id === bill.contractId);
    if (!contract) return null;
    return properties.find((p) => p.propertyId === contract.propertyId);
  };

  return (
    <div className="space-y-4">
      {bills.map((bill) => {
        const statusConfig = getStatusConfig(bill.status);
        const isOverdue = bill.status === "OVERDUE";
        const isPending = bill.status === "PENDING";
        const property = getPropertyForBill(bill);
        const propertyImage =
          property?.coverImageUrl ||
          property?.mediaList?.[0]?.url ||
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

        return (
          <div
            key={bill.id}
            className="grid gap-0 overflow-hidden rounded-[28px] border border-[#E8D8C7] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF3E8] shadow-[0_14px_34px_rgba(98,60,26,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B45309] hover:ring-2 hover:ring-[#CC6F4A]/35 hover:shadow-[0_22px_48px_rgba(98,60,26,0.18)] lg:grid-cols-[220px_minmax(0,1fr)]"
            onClick={() => onView(bill)}
          >
            <div className="relative h-52 lg:h-full">
              <img
                src={propertyImage}
                alt={property?.title || "Property"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute left-4 top-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-lg font-semibold text-[#1F2937] md:text-xl">
                      {property?.title || "Bất động sản"}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
                      <MapPin className="h-4 w-4 text-[#CC6F4A]" />
                      <span className="line-clamp-1">
                        {property?.address?.fullAddress ||
                          property?.address?.district ||
                          "N/A"}
                      </span>
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#8B5E3C]">
                      <FileText className="h-4 w-4" />
                      <span>Mã HĐ: {bill.id?.substring(0, 16)}...</span>
                    </p>

                    {isOverdue && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#991B1B]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Vui lòng thanh toán ngay
                      </p>
                    )}
                  </div>

                  <div className="min-w-[220px] rounded-2xl border border-[#F3E2D3] bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                      Số tiền
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#CC6F4A]">
                      {formatCurrency(bill.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                      Tháng
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                      <Calendar className="h-4 w-4 text-[#CC6F4A]" />
                      {formatDate(bill.billingMonth)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                      Hạn
                    </p>
                    <p
                      className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${
                        isOverdue ? "text-[#991B1B]" : "text-[#1F2937]"
                      }`}
                    >
                      <Clock className="h-4 w-4 text-[#CC6F4A]" />
                      {formatDate(bill.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TenantBillCards;
