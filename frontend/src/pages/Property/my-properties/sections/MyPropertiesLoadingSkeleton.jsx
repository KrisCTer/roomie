import React from "react";

const MyPropertiesLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="home-skeleton-block h-12 animate-pulse rounded-xl" />
      <div className="home-skeleton-block h-12 animate-pulse rounded-xl" />
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="home-skeleton-block h-40 animate-pulse rounded-2xl"
        />
      ))}
    </div>
  );
};

export default MyPropertiesLoadingSkeleton;
