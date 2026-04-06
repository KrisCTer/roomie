/* aria-label */
import React, { useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  BedDouble,
  Box,
  CalendarDays,
  CircleAlert,
  Clock3,
  FileText,
  House,
  MapPin,
  Pencil,
  ScanSearch,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestModel3d } from "../../../services/propertyService";

const PropertyCard = ({
  property,
  onEdit,
  onViewBookings,
  onDelete,
  onPublish,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [requesting3d, setRequesting3d] = useState(false);

  const handleOpenDetail = () => {
    navigate(`/property/${property.propertyId}`);
  };

  const coverImage =
    property.coverImageUrl ||
    property.mediaList?.[0]?.url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";

  const roomImageCount =
    property.mediaList?.filter((m) => m.category !== "COVER")?.length ||
    property.mediaList?.length ||
    0;

  const canRequest3d =
    roomImageCount >= 8 && property.model3dStatus !== "PROCESSING";

  const handleRequest3D = async (e) => {
    e.stopPropagation();
    if (!canRequest3d) return;

    const hasModel = property.model3dStatus === "COMPLETED";
    if (
      hasModel &&
      !window.confirm(
        "Mô hình 3D hiện tại sẽ bị thay thế. Bạn có chắc muốn tạo lại?",
      )
    ) {
      return;
    }

    try {
      setRequesting3d(true);
      await requestModel3d(property.propertyId);
      if (onRefresh) onRefresh();
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể tạo mô hình 3D.";
      window.alert(msg);
    } finally {
      setRequesting3d(false);
    }
  };

  // ===== STATUS CONFIG =====
  const getApprovalConfig = (status) => {
    const configs = {
      DRAFT: {
        bg: "bg-[#F5F1EB] text-[#7C4A2F] border border-[#E7D8C7]",
        text: "Draft",
        icon: FileText,
      },
      PENDING: {
        bg: "bg-[#FFF4E8] text-[#9A3412] border border-[#F5D9C4]",
        text: "Waiting approval",
        icon: Clock3,
      },
      ACTIVE: {
        bg: "bg-[#ECFDF5] text-[#166534] border border-[#BBF7D0]",
        text: "Approved",
        icon: BadgeCheck,
      },
      REJECTED: {
        bg: "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]",
        text: "Rejected",
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const getPropertyStatusConfig = (status) => {
    const configs = {
      AVAILABLE: {
        bg: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#D7E4FF]",
        text: "Available",
        icon: House,
      },
      RENTED: {
        bg: "bg-[#ECFDF5] text-[#047857] border border-[#BFECD8]",
        text: "Rented",
        icon: ScanSearch,
      },
      INACTIVE: {
        bg: "bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]",
        text: "Inactive",
        icon: CircleAlert,
      },
    };
    return configs[status] || null;
  };

  const get3dStatusConfig = (status) => {
    const configs = {
      PROCESSING: {
        bg: "bg-[#FFF4E8] text-[#9A3412] border border-[#F5D9C4]",
        text: "3D Processing",
        icon: Box,
        animate: true,
      },
      COMPLETED: {
        bg: "bg-[#ECFDF5] text-[#166534] border border-[#BFECD8]",
        text: "3D Ready",
        icon: Sparkles,
      },
      FAILED: {
        bg: "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]",
        text: "3D Failed",
        icon: CircleAlert,
      },
    };
    return configs[status] || null;
  };

  const approvalConfig = getApprovalConfig(property.status);
  const propertyStatusConfig = getPropertyStatusConfig(property.propertyStatus);
  const model3dConfig = get3dStatusConfig(property.model3dStatus);

  const canPublish = property.status === "DRAFT";
  const ApprovalIcon = approvalConfig.icon;
  const PropertyStatusIcon = propertyStatusConfig?.icon;
  const Model3dIcon = model3dConfig?.icon;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  return (
    <div
      onClick={handleOpenDetail}
      className="cursor-pointer overflow-hidden rounded-[28px] border border-[#E8D8C7] bg-gradient-to-br from-white via-[#FFFDF8] to-[#FFF3E8] shadow-[0_14px_34px_rgba(98,60,26,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B45309] hover:ring-2 hover:ring-[#CC6F4A]/35 hover:shadow-[0_22px_48px_rgba(98,60,26,0.18)]"
    >
      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="relative h-56 lg:h-full">
          <img
            src={coverImage}
            alt={property.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B5E3C] backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              Property
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-[#FFF4E8]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A3412] backdrop-blur-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(property.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${approvalConfig.bg}`}
                  >
                    <ApprovalIcon className="h-3.5 w-3.5" />
                    {approvalConfig.text}
                  </span>

                  {propertyStatusConfig && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${propertyStatusConfig.bg}`}
                    >
                      <PropertyStatusIcon className="h-3.5 w-3.5" />
                      {propertyStatusConfig.text}
                    </span>
                  )}

                  {model3dConfig && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${model3dConfig.bg}`}
                    >
                      <Model3dIcon
                        className={`h-3.5 w-3.5 ${model3dConfig.animate ? "animate-spin" : ""}`}
                      />
                      {model3dConfig.text}
                    </span>
                  )}
                </div>

                <h3 className="line-clamp-1 text-lg font-semibold text-[#1F2937] md:text-xl">
                  {property.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <MapPin className="h-4 w-4 text-[#CC6F4A]" />
                  <span className="line-clamp-1">
                    {property.address?.fullAddress ||
                      property.address?.province ||
                      "N/A"}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#F3E2D3] bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                  Monthly rent
                </p>
                <p className="mt-1 text-xl font-bold text-[#CC6F4A] md:text-2xl">
                  {property.monthlyRent?.toLocaleString()} VND
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                  Bedrooms
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                  <BedDouble className="h-4 w-4 text-[#CC6F4A]" />
                  {property.bedrooms ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                  Bathrooms
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                  <House className="h-4 w-4 text-[#CC6F4A]" />
                  {property.bathrooms ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E3D5] bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A6A47]">
                  3D Images
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                  <Sparkles className="h-4 w-4 text-[#CC6F4A]" />
                  {roomImageCount}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[#EFE3D4] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(property.propertyId);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#D6E4FF] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#1D4ED8] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewBookings(property);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#BFECD8] bg-[#ECFDF5] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#047857] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Create Contract
              </button>

              {roomImageCount >= 8 && (
                <button
                  type="button"
                  onClick={handleRequest3D}
                  disabled={!canRequest3d || requesting3d}
                  className="inline-flex items-center gap-2 rounded-full border border-[#F5D9C4] bg-[#FFF4E8] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#9A3412] transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Box
                    className={`h-4 w-4 ${requesting3d ? "animate-spin" : ""}`}
                  />
                  {property.model3dStatus === "COMPLETED"
                    ? "Tạo lại 3D"
                    : property.model3dStatus === "PROCESSING"
                      ? "Đang xử lý..."
                      : "Tạo 3D"}
                </button>
              )}

              {canPublish && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPublish(property);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C7E8D4] bg-[#F0FDF4] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#166534] transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  Publish
                </button>
              )}

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(property.propertyId);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#991B1B] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
