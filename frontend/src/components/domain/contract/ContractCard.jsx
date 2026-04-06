import React from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  User,
  Wallet,
} from "lucide-react";

const ContractCard = ({
  contract,
  role,
  onClick,
  propertyData,
  tenantData,
  landlordData,
  currentUserId,
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        label: "Active",
        bgColor: "bg-emerald-500/15 border border-emerald-500/35",
        textColor: "text-emerald-700",
        icon: CheckCircle,
      },
      PENDING_SIGNATURE: {
        label: "Pending Signature",
        bgColor: "bg-amber-500/15 border border-amber-500/35",
        textColor: "text-amber-700",
        icon: Clock,
      },
      PENDING_PAYMENT: {
        label: "Pending Payment",
        bgColor: "bg-sky-500/15 border border-sky-500/35",
        textColor: "text-sky-700",
        icon: Clock,
      },
      EXPIRED: {
        label: "Expired",
        bgColor: "bg-slate-500/15 border border-slate-500/35",
        textColor: "text-slate-700",
        icon: AlertCircle,
      },
      TERMINATED: {
        label: "Terminated",
        bgColor: "bg-rose-500/15 border border-rose-500/35",
        textColor: "text-rose-700",
        icon: AlertCircle,
      },
      PAUSED: {
        label: "Paused",
        bgColor: "bg-orange-500/15 border border-orange-500/35",
        textColor: "text-orange-700",
        icon: AlertCircle,
      },
      DRAFT: {
        label: "Draft",
        bgColor: "bg-zinc-500/15 border border-zinc-500/35",
        textColor: "text-zinc-700",
        icon: FileText,
      },
    };

    return configs[status] || configs.DRAFT;
  };

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  const propertyTitle = propertyData?.title || "Loading...";
  const propertyAddress = propertyData?.address?.fullAddress || "Loading...";
  const monthlyRent = propertyData?.monthlyRent || 0;
  const rentalDeposit = propertyData?.rentalDeposit || 0;
  const isLandlord = contract.landlordId === currentUserId;
  const otherPartyData = isLandlord ? tenantData : landlordData;
  const otherPartyLabel = isLandlord ? "Tenant" : "Landlord";

  const getFullName = (userData) => {
    if (!userData) return "Loading...";
    const firstName = userData?.firstName || "";
    const lastName = userData?.lastName || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  };

  const otherPartyName = getFullName(otherPartyData);
  const otherPartyPhone = otherPartyData?.phoneNumber || "N/A";
  const otherPartyEmail = otherPartyData?.email || "N/A";
  const isSigned =
    role === "landlord" ? contract.landlordSigned : contract.tenantSigned;
  const otherPartySigned =
    role === "landlord" ? contract.tenantSigned : contract.landlordSigned;
  const isPropertyLoading = !propertyData;
  const isUserLoading = !otherPartyData;
  const coverImage =
    propertyData?.coverImageUrl ||
    propertyData?.mediaList?.[0]?.url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-[28px] border border-[#E8D8C7] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF3E8] shadow-[0_14px_34px_rgba(98,60,26,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B45309] hover:ring-2 hover:ring-[#CC6F4A]/35 hover:shadow-[0_22px_48px_rgba(98,60,26,0.18)]"
    >
      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative h-56 lg:h-full">
          <img
            src={coverImage}
            alt={propertyTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        </div>

        <div className="flex min-w-0 flex-col p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span
                  className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>

                <h3 className="line-clamp-1 text-lg font-semibold text-[#1F2937] md:text-xl">
                  {isPropertyLoading ? (
                    <span className="inline-block h-6 w-48 animate-pulse rounded bg-white/70" />
                  ) : (
                    propertyTitle
                  )}
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <MapPin className="h-4 w-4 text-[#CC6F4A]" />
                  <span className="line-clamp-1">
                    {isPropertyLoading ? (
                      <span className="inline-block h-4 w-64 animate-pulse rounded bg-white/70" />
                    ) : (
                      propertyAddress
                    )}
                  </span>
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#8B5E3C]">
                  <FileText className="h-4 w-4" />
                  <span>{contract.id?.substring(0, 8)}...</span>
                </p>
              </div>

              <div className="min-w-[280px] rounded-2xl border border-[#F3E2D3] bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#F1E5D9] bg-white/70 p-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                      Monthly rent
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#CC6F4A] md:text-2xl">
                      {formatCurrency(monthlyRent)}
                    </p>
                    <p className="mt-1 text-xs font-normal text-[#6E675F]">
                      /tháng
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#F1E5D9] bg-white/70 p-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                      Tiền đặt cọc
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#2B2A28] md:text-2xl">
                      {formatCurrency(rentalDeposit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#CC6F4A]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6E675F]">
                    {otherPartyLabel}
                  </p>
                </div>

                {isUserLoading ? (
                  <div className="space-y-2">
                    <div className="animate-pulse rounded bg-white/80 h-4 w-32"></div>
                    <div className="animate-pulse rounded bg-white/80 h-3 w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="mb-1 text-sm font-bold text-[#2B2A28]">
                      {otherPartyName}
                    </p>
                    <div className="mb-1 flex items-center gap-1 text-xs text-[#6E675F]">
                      <Phone className="w-3 h-3 text-[#CC6F4A]" />
                      {otherPartyPhone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#6E675F]">
                      <Mail className="w-3 h-3 text-[#CC6F4A]" />
                      <span className="truncate">{otherPartyEmail}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#EFE3D4] pt-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs text-[#8A837A]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#CC6F4A]" />
                  <span>Thời gian thuê</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-[#2B2A28]">
                    {formatDate(contract.startDate)}
                  </span>
                  <span className="text-[#CC6F4A]">→</span>
                  <span className="font-semibold text-[#2B2A28]">
                    {formatDate(contract.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 text-sm md:text-right">
                <div
                  className={`flex items-center gap-1.5 ${isSigned ? "text-green-600" : "text-gray-400"}`}
                >
                  {isSigned ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {role === "landlord" ? "Chủ nhà" : "Người thuê nhà"}:{" "}
                    {isSigned ? "Đã ký" : "Chưa ký"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${otherPartySigned ? "text-green-600" : "text-gray-400"}`}
                >
                  {otherPartySigned ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {role === "landlord" ? "Người thuê nhà" : "Chủ nhà"}:{" "}
                    {otherPartySigned ? "Đã ký" : "Chưa ký"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
