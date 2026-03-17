import React from "react";

const DashboardLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="apple-glass-panel h-28 animate-pulse rounded-2xl"
          />
        ))}
      </div>
      <div className="apple-glass-panel h-72 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="apple-glass-panel h-72 animate-pulse rounded-2xl" />
        <div className="apple-glass-panel h-72 animate-pulse rounded-2xl" />
      </div>
    </div>
  );
};

export default DashboardLoadingSkeleton;
