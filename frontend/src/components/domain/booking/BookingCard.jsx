/* aria-label */
import React from "react";
import {
  BadgeCheck,
  Calendar,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCircle,
  FileText,
  MapPin,
  Landmark,
  Wallet,
} from "lucide-react";

const BookingCard = ({ booking, isOwner }) => {
  const {
    bookingReference,
    propertyId,
    propertyTitle,
    propertyAddress,
    propertyImageUrl,
    property,
    leaseStart,
    leaseEnd,
    duration,
    monthlyRent,
    rentalDeposit,
    status,
    createdAt,
    tenantId,
    onCancel,
    onConfirm,
    onViewTenantProfile,
  } = booking;

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      PENDING_APPROVAL: {
        bg: "bg-[#FFF4E8] text-[#9A3412] border border-[#F5D9C4]",
        label: "Pending",
        icon: Clock,
      },
      ACTIVE: {
        bg: "bg-[#ECFDF5] text-[#166534] border border-[#BFECD8]",
        label: "Active",
        icon: BadgeCheck,
      },
      PAUSED: {
        bg: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#D7E4FF]",
        label: "Paused",
        icon: AlertCircle,
      },
      TERMINATED: {
        bg: "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]",
        label: "Terminated",
        icon: X,
      },
      EXPIRED: {
        bg: "bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]",
        label: "Expired",
        icon: AlertCircle,
      },
      RENEWED: {
        bg: "bg-[#ECFEFF] text-[#0F766E] border border-[#A5F3FC]",
        label: "Renewed",
        icon: CheckCircle,
      },
    };
    return configs[status] || configs.PENDING_APPROVAL;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const coverImage =
    propertyImageUrl ||
    property?.coverImageUrl ||
    property?.mediaList?.[0]?.url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";
  const displayTitle =
    propertyTitle || property?.title || bookingReference || "Booking";
  const displayAddress =
    propertyAddress || property?.address?.fullAddress || propertyId || "N/A";

  const actionButtonBase =
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.04em] transition hover:-translate-y-0.5 hover:shadow-sm";

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E8D8C7] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF3E8] shadow-[0_14px_34px_rgba(98,60,26,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B45309] hover:ring-2 hover:ring-[#CC6F4A]/35 hover:shadow-[0_22px_48px_rgba(98,60,26,0.18)]">
      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="relative h-56 lg:h-full">
          <img
            src={coverImage}
            alt={displayTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B5E3C] backdrop-blur-sm">
              <FileText className="h-3.5 w-3.5" />
              Booking
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-[#FFF4E8]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A3412] backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5" />
              {createdAt}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span
                  className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bg}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>

                <h3 className="line-clamp-1 text-lg font-semibold text-[#1F2937] md:text-xl">
                  {displayTitle}
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <MapPin className="h-4 w-4 text-[#CC6F4A]" />
                  <span className="line-clamp-1">{displayAddress}</span>
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#8B5E3C]">
                  <FileText className="h-4 w-4" />
                  <span>{bookingReference}</span>
                </p>
              </div>

              <div className="min-w-[280px] rounded-2xl border border-[#F3E2D3] bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#F1E5D9] bg-white/70 p-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                      Monthly rent
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#CC6F4A] md:text-2xl">
                      {monthlyRent?.toLocaleString()} VND
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#F1E5D9] bg-white/70 p-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                      Tiền đặt cọc
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#2B2A28] md:text-2xl">
                      {rentalDeposit?.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                  Ngày bắt đầu
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                  <Calendar className="h-4 w-4 text-[#CC6F4A]" />
                  {leaseStart}
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                  Ngày kết thúc
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                  <Calendar className="h-4 w-4 text-[#CC6F4A]" />
                  {leaseEnd}
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                  Thời gian
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                  <Landmark className="h-4 w-4 text-[#CC6F4A]" />
                  {duration}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[#EFE3D4] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && tenantId && onViewTenantProfile && (
                <button
                  onClick={onViewTenantProfile}
                  className={`${actionButtonBase} border-[#CDECE7] bg-[#EBFFFA] text-[#0F766E]`}
                >
                  <UserCircle className="h-4 w-4" />
                  Hồ sơ người thuê
                </button>
              )}

              {status === "PENDING_APPROVAL" && onConfirm && (
                <button
                  onClick={onConfirm}
                  className={`${actionButtonBase} border-[#BFECD8] bg-[#ECFDF5] text-[#047857]`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận
                </button>
              )}

              {(status === "PENDING_APPROVAL" || status === "ACTIVE") &&
                onCancel && (
                  <button
                    onClick={onCancel}
                    className={`${actionButtonBase} border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]`}
                  >
                    <X className="h-4 w-4" />
                    {status === "ACTIVE" ? "Kết thúc" : "Hủy bỏ"}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
