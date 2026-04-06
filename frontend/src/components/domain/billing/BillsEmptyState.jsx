import React from "react";
import { FileText } from "lucide-react";

const BillsEmptyState = () => {
  return (
    <div className="home-glass-soft rounded-2xl p-12 text-center">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Chưa có hóa đơn nào</p>
    </div>
  );
};

export default BillsEmptyState;
