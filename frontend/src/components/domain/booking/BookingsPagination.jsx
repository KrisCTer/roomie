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
    <div className="home-glass-soft flex items-center justify-center gap-2 rounded-2xl px-4 py-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>

      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
        const pageNum = index + 1;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`rounded-lg px-4 py-2 transition-colors ${
              currentPage === pageNum
                ? "bg-[#CC6F4A] text-white"
                : "text-gray-600 hover:bg-white/60"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {totalPages > 5 && <span className="px-3 py-2 text-gray-600">...</span>}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>
    </div>
  );
};

export default BookingsPagination;
