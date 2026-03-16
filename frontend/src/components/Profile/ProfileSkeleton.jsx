import React from "react";

const ProfileSkeleton = () => {
  return (
    <>
      {/* Avatar Skeleton */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>

        <div className="flex-1 space-y-3">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Profile Info Form Skeleton */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <div className="w-40 h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Password form skeleton */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="w-40 h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfileSkeleton;
