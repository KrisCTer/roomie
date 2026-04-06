/* aria-label */
// src/components/Billing/BillActionsEnhanced.jsx
import React from "react";
import { DollarSign, ArrowLeft } from "lucide-react";
import BillPdfDownloader from "./BillPdfDownloader";

/**
 * Enhanced BillActions Component
 * Includes PDF download/preview functionality
 */
const BillActionsEnhanced = ({ bill, canPay, onPayment, onBack }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-5">Thao tác</h2>

      <div className="space-y-4">
        {/* Pay Button */}
        {canPay && (
          <button
            onClick={onPayment}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-200 group"
          >
            <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Thanh toán hóa đơn
          </button>
        )}

        {/* PDF Download */}
        <div className="pt-2">
          <BillPdfDownloader
            billId={bill.id}
            billMonth={bill.billingMonth?.substring(0, 7)}
            className="w-full"
          />
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all font-bold border border-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

export default BillActionsEnhanced;


