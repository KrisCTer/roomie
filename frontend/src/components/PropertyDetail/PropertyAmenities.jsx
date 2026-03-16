// src/components/PropertyDetail/PropertyAmenities.jsx
import React, { useState } from "react";
import {
  Shield,
  Bed,
  UtensilsCrossed,
  Sparkles,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PropertyAmenities = ({ amenities }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);

  if (!amenities) return null;

  const amenityGroups = [
    {
      key: "homeSafety",
      title: "An toàn & Bảo mật",
      icon: <Shield className="w-6 h-6" />,
      items: amenities.homeSafety || [],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      key: "bedroom",
      title: "Phòng ngủ",
      icon: <Bed className="w-6 h-6" />,
      items: amenities.bedroom || [],
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      key: "kitchen",
      title: "Nhà bếp",
      icon: <UtensilsCrossed className="w-6 h-6" />,
      items: amenities.kitchen || [],
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      key: "others",
      title: "Tiện ích khác",
      icon: <Sparkles className="w-6 h-6" />,
      items: amenities.others || [],
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ].filter((group) => group.items.length > 0);

  if (amenityGroups.length === 0) return null;

  const totalCount = amenityGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">
                Tiện nghi & Dịch vụ
              </h3>
              <span className="text-sm text-gray-500 font-medium">
                ({totalCount} tiện ích)
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Content - Expandable */}
        {isExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            {/* Amenities Grid */}
            <div className="space-y-6">
              {amenityGroups.map((group) => (
                <div key={group.key}>
                  {/* Group Header */}
                  <div
                    className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${group.bgColor} border ${group.borderColor}`}
                  >
                    <div className={`${group.color}`}>{group.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {group.title}
                    </h3>
                    <span className="ml-auto text-sm font-semibold text-gray-600">
                      {group.items.length} tiện ích
                    </span>
                  </div>

                  {/* Group Items - Show first 6 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                    {group.items.slice(0, 6).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-800">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Show more indicator */}
                  {group.items.length > 6 && (
                    <div className="mt-3 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        + Xem thêm {group.items.length - 6} tiện ích
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show All Button */}
            {totalCount > 10 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllModal(true);
                }}
                className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm w-full"
              >
                Xem tất cả {totalCount} tiện nghi
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Amenities Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Tất cả tiện nghi ({totalCount})
              </h2>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {amenityGroups.map((group) => (
                  <div key={group.key}>
                    {/* Group Header */}
                    <div
                      className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${group.bgColor} border ${group.borderColor}`}
                    >
                      <div className={group.color}>{group.icon}</div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {group.title}
                      </h3>
                      <span className="ml-auto text-sm font-semibold text-gray-600">
                        {group.items.length} tiện ích
                      </span>
                    </div>

                    {/* All Group Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAllModal(false)}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyAmenities;

