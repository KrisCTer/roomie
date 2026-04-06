import React from "react";

const BillsLoadingState = () => {
  return (
    <div className="p-12 text-center">
      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Đang tải...</p>
    </div>
  );
};

export default BillsLoadingState;
