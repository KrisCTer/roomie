import React from "react";

const AddPropertyLoadingSkeleton = () => {
  return (
    <div className="home-glass-card rounded-3xl p-10">
      <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent" />
      <p className="text-center text-sm font-medium text-slate-600">
        Loading property data...
      </p>
    </div>
  );
};

export default AddPropertyLoadingSkeleton;
