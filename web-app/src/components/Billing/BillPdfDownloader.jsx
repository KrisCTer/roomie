// src/components/Billing/BillPdfDownloader.jsx
import React, { useState } from "react";
import { Download, Eye, Loader } from "lucide-react";
import { CONFIG } from "../../configurations/configuration";

/**
 * BillPdfDownloader Component
 * Handles PDF download and preview for bills
 */
const BillPdfDownloader = ({ billId, billMonth, className = "" }) => {
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  /**
   * Download PDF to user's device
   */
  const handleDownload = async () => {
    try {
      setDownloading(true);

      const token = getAuthToken();
      const url = `${CONFIG.API_GATEWAY}/billing/${billId}/pdf`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `bill_${billMonth || billId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log("✅ PDF downloaded successfully:", filename);
    } catch (error) {
      console.error("Error downloading PDF:", error);
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

      const token = getAuthToken();
      const url = `${CONFIG.API_GATEWAY}/billing/${billId}/pdf/preview`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to preview PDF");
      }

      // Create blob and open in new tab
      const blob = await response.blob();
      const previewUrl = window.URL.createObjectURL(blob);
      window.open(previewUrl, "_blank");

      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(previewUrl);
      }, 1000);

      console.log("✅ PDF preview opened");
    } catch (error) {
      console.error("Error previewing PDF:", error);
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
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Preview PDF"
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
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download PDF"
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
