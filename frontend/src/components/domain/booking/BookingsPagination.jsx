import React from "react";

const BookingsPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 px-6 py-6 border-t">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ‹
      </button>
      
      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
        const pageNum = index + 1;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === pageNum
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      
      {totalPages > 5 && (
        <span className="px-3 py-2 text-gray-600">...</span>
      )}
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
};

export default BookingsPagination;