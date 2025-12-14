import React from "react";
import { FileText } from "lucide-react";

const BillsEmptyState = () => {
  return (
    <div className="p-12 text-center">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-600">Chưa có hóa đơn nào</p>
    </div>
  );
};

export default BillsEmptyState;
