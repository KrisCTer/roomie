import React from "react";
import { Eye, Pencil, Send, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconButton from "../common/IconButton";

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

  // ===== STATUS CONFIG =====
  const getApprovalConfig = (status) => {
    const configs = {
      DRAFT: { bg: "bg-gray-500", text: "Draft" },
      PENDING: { bg: "bg-orange-500", text: "Waiting approval" },
      ACTIVE: { bg: "bg-green-600", text: "Approved" },
      REJECTED: { bg: "bg-red-600", text: "Rejected" },
    };
    return configs[status] || configs.DRAFT;
  };

  const getPropertyStatusConfig = (status) => {
    const configs = {
      AVAILABLE: { bg: "bg-blue-600", text: "Available" },
      RENTED: { bg: "bg-purple-600", text: "Rented" },
      INACTIVE: { bg: "bg-gray-400", text: "Inactive" },
    };
    return configs[status];
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
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border hover:shadow-md transition">
      {/* ===== CLICKABLE CONTENT ===== */}
      <div className="flex items-center gap-4 flex-1">
        <img
          src={
            property.mediaList?.[0]?.url ||
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
          }
          alt={property.title}
          className="w-24 h-24 object-cover rounded-lg"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>

          <p className="text-sm text-gray-500 mb-2">
            {formatDate(property.createdAt)}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-600 font-semibold">
              {property.monthlyRent?.toLocaleString()} VND
            </span>

            <span
              className={`px-3 py-1 rounded-full text-white text-xs ${approvalConfig.bg}`}
            >
              {approvalConfig.text}
            </span>

            {propertyStatusConfig && (
              <span
                className={`px-3 py-1 rounded-full text-white text-xs ${propertyStatusConfig.bg}`}
              >
                {propertyStatusConfig.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== ACTION ICONS ===== */}
      <div className="flex items-center gap-2">
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
