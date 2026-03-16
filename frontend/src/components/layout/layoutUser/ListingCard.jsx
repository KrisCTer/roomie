import { Edit, Trash2, UploadCloud } from "lucide-react";

const ListingCard = ({ listing }) => {
  const normalizeStatus = (s) => (s || "").toString().trim().toUpperCase();

  const getStatusConfig = (rawStatus) => {
    const status = normalizeStatus(rawStatus);

    const map = {
      DRAFT: { label: "Draft", color: "bg-gray-500" },
      PENDING: { label: "Pending", color: "bg-orange-500" },
      APPROVED: { label: "Approved", color: "bg-green-500" },
      REJECTED: { label: "Rejected", color: "bg-red-500" },
      INACTIVE: { label: "Inactive", color: "bg-slate-500" },
      SOLD: { label: "Sold", color: "bg-purple-500" },
      RENTED: { label: "Rented", color: "bg-purple-500" },
      AVAILABLE: { label: "Available", color: "bg-green-500" },
    };

    return map[status] || { label: status || "Unknown", color: "bg-gray-500" };
  };

  const statusConfig = getStatusConfig(listing.status);
  const statusNormalized = normalizeStatus(listing.status);
  const isDraft = statusNormalized === "DRAFT";

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-28 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer"
        onClick={listing.onClick}
      />

      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold mb-1 truncate cursor-pointer hover:text-blue-600"
          onClick={listing.onClick}
        >
          {listing.title}
        </h3>

        <p className="text-sm text-gray-500 mb-1">
          Posting date: {listing.date}
        </p>

        <p className="text-lg font-bold text-blue-600">{listing.price}</p>
      </div>

      <span
        className={`${statusConfig.color} text-white px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0`}
        title={statusNormalized}
      >
        {statusConfig.label}
      </span>

      <div className="flex flex-col gap-2 text-sm text-gray-600 flex-shrink-0">
        {/* Post: chỉ hiện khi DRAFT */}
        {isDraft && (
          <button
            className="flex items-center gap-2 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={listing.onPost}
            disabled={listing.isPosting}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{listing.isPosting ? "Posting..." : "Post"}</span>
          </button>
        )}

        <button
          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          onClick={listing.onEdit}
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>

        <button
          className="flex items-center gap-2 hover:text-red-600 transition-colors"
          onClick={listing.onDelete}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ListingCard;
