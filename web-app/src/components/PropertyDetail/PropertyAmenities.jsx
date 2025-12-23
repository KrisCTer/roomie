import React, { useState } from "react";
import {
  Shield,
  Bed,
  UtensilsCrossed,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const PropertyAmenities = ({ amenities }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  if (!amenities) return null;

  const amenityGroups = [
    {
      key: "homeSafety",
      title: "Home Safety",
      icon: <Shield className="w-6 h-6" />,
      items: amenities.homeSafety || [],
      color: "text-blue-600",
    },
    {
      key: "bedroom",
      title: "Bedroom",
      icon: <Bed className="w-6 h-6" />,
      items: amenities.bedroom || [],
      color: "text-purple-600",
    },
    {
      key: "kitchen",
      title: "Kitchen",
      icon: <UtensilsCrossed className="w-6 h-6" />,
      items: amenities.kitchen || [],
      color: "text-orange-600",
    },
    {
      key: "others",
      title: "Other Amenities",
      icon: <Sparkles className="w-6 h-6" />,
      items: amenities.others || [],
      color: "text-green-600",
    },
  ].filter((group) => group.items.length > 0);

  if (amenityGroups.length === 0) return null;

  //   // Get first 10 amenities for preview
  //   const allAmenities = amenityGroups.flatMap((g) =>
  //     g.items.map((item) => ({ item, group: g }))
  //   );
  //   const previewAmenities = allAmenities.slice(0, 10);
  // const totalCount = allAmenities.length;
  const totalCount = amenityGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      <div className="pb-8 border-b border-gray-200">
        <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>

        {/* Preview Grid - First 10 items */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {amenityGroups.map((group) => (
            <div key={group.key}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={group.color}>{group.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.title}
                </h3>
              </div>

              {/* Group items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2">
                    <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Show more hint */}
              {group.items.length > 6 && (
                <div className="mt-2 text-sm text-gray-500">
                  + {group.items.length - 6} more
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show All Button */}
        {totalCount > 10 && (
          <button
            onClick={() => setShowAllModal(true)}
            className="mt-6 px-6 py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
          >
            <span>Show all {totalCount} amenities</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Full Amenities Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">All Amenities</h2>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {amenityGroups.map((group) => (
                  <div key={group.key}>
                    {/* Group header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={group.color}>{group.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.title}
                      </h3>
                    </div>

                    {/* Group items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-2">
                          <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Show more hint */}
                    {group.items.length > 6 && (
                      <div className="mt-2 text-sm text-gray-500">
                        + {group.items.length - 6} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAllModal(false)}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyAmenities;
