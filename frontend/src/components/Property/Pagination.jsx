import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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
    <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#E8D8C7] pt-6">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="rounded-xl px-3 py-2 text-gray-600 transition hover:bg-[#F6EEE5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>

      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
        const pageNum = index + 1;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 rounded-lg transition ${
              currentPage === pageNum
                ? "bg-[#CC6F4A] text-white"
                : "text-gray-600 hover:bg-[#F6EEE5]"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="rounded-xl px-3 py-2 text-gray-600 transition hover:bg-[#F6EEE5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
