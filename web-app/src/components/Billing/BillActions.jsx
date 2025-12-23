import React, { useState } from "react";
import { DollarSign, Download, Share2, ArrowLeft, Eye } from "lucide-react";
import {
  downloadBillPdf,
  openBillPdfPreview,
} from "../../services/billing.service";

const BillActions = ({ bill, canPay, onPayment, onBack }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadBillPdf(bill.id);
      alert("✅ PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(
        "❌ Failed to download PDF: " + (error?.message || "Unknown error")
      );
    } finally {
      setDownloading(false);
    }
  };

  const handlePreviewPdf = () => {
    openBillPdfPreview(bill.id);
  };

  const handleShare = () => {
    const billUrl = `${window.location.origin}/bill-detail/${bill.id}`;
    navigator.clipboard
      .writeText(billUrl)
      .then(() => {
        alert("✅ Bill link copied to clipboard!");
      })
      .catch(() => {
        alert("❌ Failed to copy link");
      });
  };

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

        <button
          onClick={handlePreviewPdf}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          <Eye className="w-5 h-5" />
          Preview PDF
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <Share2 className="w-5 h-5" />
          Share Link
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
