import React from "react";
import { FileText } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Đang tải hợp đồng...
      </h3>
    </div>
  );
};

export default LoadingState;
