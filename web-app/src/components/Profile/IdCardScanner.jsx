import React from "react";
import { Upload, Camera } from "lucide-react";

const IdCardScanner = ({ onFileSelect, onOpenCamera }) => {
  return (
    <div className="flex-1 max-w-[550px] mr-auto">
      <p className="text-sm text-gray-600 mb-3">
        Scan ID Card (CCCD/CMND) to auto-fill information
      </p>
      <div className="flex flex-col gap-3">
        {/* Upload Button */}
        <label className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition shadow-md">
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload ID Card Image</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileSelect}
          />
        </label>

        {/* Camera Button */}
        <button
          onClick={onOpenCamera}
          className="flex items-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
        >
          <Camera className="w-5 h-5" />
          <span className="font-medium">Open Camera to Scan</span>
        </button>

        <p className="text-xs text-gray-500 mt-2">
          📷 Support QR code scanning and OCR to automatically fill in
          information from CCCD/CMND
        </p>
      </div>
    </div>
  );
};

export default IdCardScanner;
