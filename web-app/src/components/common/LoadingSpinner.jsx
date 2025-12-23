import React from "react";
import { Home } from "lucide-react";

const LoadingSpinner = ({ message = "Loading property..." }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin"></div>

        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Home className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
