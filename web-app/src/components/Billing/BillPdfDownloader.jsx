// src/components/Billing/BillPdfDownloader.jsx
import React, { useState } from "react";
import axios from "axios";
import { Download, Eye, Loader } from "lucide-react";
import { CONFIG } from "../../configurations/configuration";
import { getToken } from "../../services/localStorageService";

/**
 * BillPdfDownloader Component
 * Handles PDF download and preview for bills
 */
const BillPdfDownloader = ({ billId, billMonth, className = "" }) => {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  /**
   * Download PDF to user's device
   */
  const handleDownload = async () => {
    try {
      setDownloading(true);

      const token = getToken();
      const url = `${CONFIG.API_GATEWAY}/billing/${billId}/pdf`;

      const res = await axios.get(url, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);

      const filename = `bill_${billMonth || billId}.pdf`.replaceAll(" ", "_");

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log("✅ PDF downloaded:", filename);
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      alert("❌ Không thể tải PDF! Vui lòng thử lại.");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Preview PDF in new tab
   */
  const handlePreview = async () => {
    try {
      setPreviewing(true);

      const token = getToken();
      const url = `${CONFIG.API_GATEWAY}/billing/${billId}/pdf/preview`;

      const res = await axios.get(url, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const previewUrl = window.URL.createObjectURL(blob);

      window.open(previewUrl, "_blank", "noopener,noreferrer");

      // Cleanup sau 1s
      setTimeout(() => {
        window.URL.revokeObjectURL(previewUrl);
      }, 1000);

      console.log("✅ PDF preview opened");
    } catch (error) {
      console.error("❌ Error previewing PDF:", error);
      alert("❌ Không thể xem trước PDF! Vui lòng thử lại.");
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Preview Button */}
      <button
        onClick={handlePreview}
        disabled={previewing}
        className="flex items-center justify-center gap-2 px-4 py-2
          bg-gray-100 text-gray-700 rounded-lg
          hover:bg-gray-200 transition
          font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Xem trước PDF"
      >
        {previewing ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Previewing...</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </>
        )}
      </button>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center justify-center gap-2 px-4 py-2
          bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 transition
          font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Tải PDF"
      >
        {downloading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Downloading...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BillPdfDownloader;
