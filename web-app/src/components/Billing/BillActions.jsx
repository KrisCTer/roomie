import React from "react";
import { DollarSign, Download, Share2, ArrowLeft } from "lucide-react";

const BillActions = ({ canPay, onPayment, onBack }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>

      <div className="space-y-3">
        {canPay && (
          <button
            onClick={onPayment}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
          >
            <DollarSign className="w-5 h-5" />
            Pay Now
          </button>
        )}

        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
          <Download className="w-5 h-5" />
          Download Bill
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
      </div>
    </div>
  );
};

export default BillActions;
