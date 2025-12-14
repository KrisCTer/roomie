import React from "react";

const IconButton = ({ icon, label, color = "text-gray-600", onClick }) => {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-2 rounded-lg hover:bg-gray-100 transition ${color}`}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <div
        className="absolute -top-9 left-1/2 -translate-x-1/2
                   bg-gray-900 text-white text-xs px-2 py-1 rounded
                   opacity-0 group-hover:opacity-100
                   pointer-events-none transition whitespace-nowrap"
      >
        {label}
      </div>
    </div>
  );
};

export default IconButton;
