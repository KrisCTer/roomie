// src/components/PropertyDetail/PropertyDescription.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

const PropertyDescription = ({ description }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!description) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Mô tả</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content - Collapsible */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDescription;
