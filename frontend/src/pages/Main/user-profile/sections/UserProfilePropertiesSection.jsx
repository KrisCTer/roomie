import React from "react";
import { Building2 } from "lucide-react";
import PropertySection from "../../../../components/layout/layoutHome/PropertySection";

const UserProfilePropertiesSection = ({ properties, transformToCardData, handlePropertyClick, t }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
        <Building2 className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t("userProfile.properties")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("userProfile.propertiesCount", {
            count: properties.length,
          })}
        </p>
      </div>
    </div>

    {properties.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-medium mb-2">
          {t("userProfile.noProperties")}
        </p>
        <p className="text-gray-500 text-sm">
          {t("userProfile.noPropertiesDesc")}
        </p>
      </div>
    ) : (
      <PropertySection
        title=""
        properties={properties.map(transformToCardData)}
        onCardClick={handlePropertyClick}
        showViewAll={false}
      />
    )}
  </div>
);

export default UserProfilePropertiesSection;
