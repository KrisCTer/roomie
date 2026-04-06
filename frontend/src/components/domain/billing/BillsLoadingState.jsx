import React from "react";

const BillsLoadingState = () => {
  return (
    <div className="home-glass-soft rounded-2xl p-12 text-center">
      <div className="inline-block w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Đang tải...</p>
    </div>
  );
};

export default BillsLoadingState;
