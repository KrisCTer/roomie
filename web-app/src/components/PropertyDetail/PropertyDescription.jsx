import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const PropertyDescription = ({ description }) => {
  const [showMore, setShowMore] = useState(false);

  if (!description) return null;

  const lines = description.split("\n");
  const shouldTruncate = lines.length > 6 || description.length > 400;
  const displayText =
    shouldTruncate && !showMore ? lines.slice(0, 6).join("\n") : description;

  return (
    <div className="pb-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">About this place</h2>

      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {displayText}
      </div>

      {shouldTruncate && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-4 flex items-center gap-1 font-semibold text-gray-900 hover:underline"
        >
          <span>{showMore ? "Show less" : "Show more"}</span>
          {showMore ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

export default PropertyDescription;
