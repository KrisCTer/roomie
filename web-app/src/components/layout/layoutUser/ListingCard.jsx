import { Edit, Trash2, CheckCircle } from "lucide-react";

const ListingCard = ({ listing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-500";
      case "Approved":
        return "bg-green-500";
      case "Sold":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

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
        className={`${getStatusColor(
          listing.status
        )} text-white px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0`}
      >
        {listing.status}
      </span>
      <div className="flex flex-col gap-2 text-sm text-gray-600 flex-shrink-0">
        <button
          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          onClick={listing.onEdit}
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          className="flex items-center gap-2 hover:text-green-600 transition-colors"
          onClick={listing.onSold}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Sold</span>
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
