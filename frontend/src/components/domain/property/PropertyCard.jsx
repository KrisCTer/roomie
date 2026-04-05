/* aria-label */
import React from "react";
import { Eye, Pencil, Send, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconButton from "../../common/IconButton";

const PropertyCard = ({
  property,
  onEdit,
  onViewBookings,
  onDelete,
  onPublish,
}) => {
  const navigate = useNavigate();

  const handleOpenDetail = () => {
    navigate(`/property/${property.propertyId}`);
  };

  const coverImage =
    property.mediaList?.[0]?.url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";

  // ===== STATUS CONFIG =====
  const getApprovalConfig = (status) => {
    const configs = {
      DRAFT: {
        bg: "bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB]",
        text: "Draft",
      },
      PENDING: {
        bg: "bg-[#FFF4E8] text-[#9A3412] border border-[#F5D9C4]",
        text: "Waiting approval",
      },
      ACTIVE: {
        bg: "bg-[#ECFDF5] text-[#166534] border border-[#BBF7D0]",
        text: "Approved",
      },
      REJECTED: {
        bg: "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]",
        text: "Rejected",
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const getPropertyStatusConfig = (status) => {
    const configs = {
      AVAILABLE: {
        bg: "bg-[#EEF4FF] text-[#1D4ED8] border border-[#D7E4FF]",
        text: "Available",
      },
      RENTED: {
        bg: "bg-[#EEFDF4] text-[#047857] border border-[#BFECD8]",
        text: "Rented",
      },
      INACTIVE: {
        bg: "bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]",
        text: "Inactive",
      },
    };
    return configs[status] || null;
  };

  const approvalConfig = getApprovalConfig(property.status);
  const propertyStatusConfig = getPropertyStatusConfig(property.propertyStatus);

  const canPublish = property.status === "DRAFT";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  return (
    <div className="rounded-2xl border border-[#E8D8C7] bg-white/95 p-4 shadow-[0_8px_18px_rgba(17,24,39,0.05)] transition hover:shadow-[0_14px_28px_rgba(17,24,39,0.08)] md:p-5">
      {/* ===== CLICKABLE CONTENT ===== */}
      <div
        className="flex cursor-pointer flex-col gap-4 sm:flex-row"
        onClick={handleOpenDetail}
      >
        <img
          src={coverImage}
          alt={property.title}
          className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-32"
        />

        <div className="flex-1">
          <h3 className="mb-1 line-clamp-1 text-base font-semibold text-gray-900">
            {property.title}
          </h3>

          <p className="mb-2 text-sm text-gray-500">
            {formatDate(property.createdAt)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#CC6F4A] md:text-base">
              {property.monthlyRent?.toLocaleString()} VND
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalConfig.bg}`}
            >
              {approvalConfig.text}
            </span>

            {propertyStatusConfig && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${propertyStatusConfig.bg}`}
              >
                {propertyStatusConfig.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== ACTION ICONS ===== */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EFE3D4] pt-3 sm:justify-end">
        <IconButton
          icon={<Eye className="w-5 h-5" />}
          label="View"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetail();
          }}
        />

        <IconButton
          icon={<Pencil className="w-5 h-5" />}
          label="Edit"
          color="text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(property.propertyId);
          }}
        />

        <IconButton
          icon={<FileText className="w-5 h-5" />}
          label="Create Contract"
          color="text-green-600"
          onClick={(e) => {
            e.stopPropagation();
            onViewBookings(property);
          }}
        />

        {canPublish && (
          <IconButton
            icon={<Send className="w-5 h-5" />}
            label="Publish"
            color="text-indigo-600"
            onClick={(e) => {
              e.stopPropagation();
              onPublish(property);
            }}
          />
        )}

        <IconButton
          icon={<Trash2 className="w-5 h-5" />}
          label="Delete"
          color="text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(property.propertyId);
          }}
        />
      </div>
    </div>
  );
};

export default PropertyCard;
