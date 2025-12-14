import React from "react";
import { FileText, Eye, Download } from "lucide-react";

const PDFViewer = ({ pdfUrl }) => {
  if (!pdfUrl) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        Xem trước hợp đồng
      </h2>
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          title="Contract PDF"
          className="bg-gray-50"
        />
      </div>
      <div className="mt-4 flex gap-3">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <Eye className="w-5 h-5" />
          Xem toàn màn hình
        </a>
        <a
          href={pdfUrl}
          download
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          <Download className="w-5 h-5" />
          Tải xuống PDF
        </a>
      </div>
    </div>
  );
};

export default PDFViewer;
