import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const ListingCardAdmin = ({ property, onApprove, onReject }) => {
  if (!property) return null;

  return (
    <div className="bg-gray-800 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">

      {/* IMAGE */}
      <div className="relative">
        <img
          src={
            property.mediaList?.[0]?.url ||
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"
          }
          alt={property.title}
          className="w-full h-48 object-cover rounded-lg"
        />

        {/* STATUS BADGE */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold
            ${
              property.status === "PENDING" || property.propertyStatus === "PENDING"
                ? "bg-yellow-500 text-black"
                : property.status === "APPROVED"
                ? "bg-green-500"
                : property.status === "REJECTED"
                ? "bg-red-500"
                : "bg-blue-500"
            }
          `}
        >
          {property.status || property.propertyStatus}
        </span>
      </div>

      {/* CONTENT */}
      <div className="mt-4">

        {/* TITLE */}
        <h3 className="text-xl font-bold">{property.title}</h3>

        {/* PRICE */}
        <p className="text-blue-400 mt-1 font-semibold">
          {property.monthlyRent?.toLocaleString()} VND / month
        </p>

        {/* OWNER */}
        <p className="text-gray-400 text-sm mt-1">
          Owner: {property.owner?.name || "Unknown"}
        </p>

        {/* DATE */}
        <p className="text-gray-400 text-sm">
          Posted: {new Date(property.createdAt).toLocaleDateString()}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 mt-4">

          {/* APPROVE BUTTON */}
          <button
            onClick={onApprove}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <CheckCircle size={18} />
            Approve
          </button>

          {/* REJECT BUTTON */}
          <button
            onClick={onReject}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <XCircle size={18} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCardAdmin;
