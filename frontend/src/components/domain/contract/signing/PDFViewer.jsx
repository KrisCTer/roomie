import React from "react";
import { FileText, Eye, Download } from "lucide-react";

const PDFViewer = ({ pdfUrl }) => {
  if (!pdfUrl) return null;

  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-[#CC6F4A]" />
        Xem trước hợp đồng
      </h2>

      <div className="border border-white/70 rounded-xl overflow-hidden bg-white/45">
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          title="Contract PDF"
          className="bg-white"
        />
      </div>

      <div className="mt-4 flex gap-3">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/70 text-[#3C3935] rounded-xl border border-white/70 hover:bg-white/85 transition-colors font-medium"
        >
          <Eye className="w-5 h-5" />
          Xem toàn màn hình
        </a>

        <a
          href={pdfUrl}
          download
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#CC6F4A] text-white rounded-xl hover:bg-[#B55D3D] transition-colors font-medium shadow-[0_8px_18px_rgba(204,111,74,0.3)]"
        >
          <Download className="w-5 h-5" />
          Tải xuống PDF
        </a>
      </div>
    </div>
  );
};

export default PDFViewer;
