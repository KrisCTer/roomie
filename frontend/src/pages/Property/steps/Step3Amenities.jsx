import React from "react";
import { useTranslation } from "react-i18next";
const Step3Amenities = ({
  propertyData,
  onAmenityToggle,
  homeSafetyOptions,
  bedroomOptions,
  kitchenOptions,
  otherOptions,
}) => {
  const { t } = useTranslation();
  const renderAmenitySection = (title, category, options) => (
    <div>
      <h3 className="font-semibold mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={propertyData[category].includes(item)}
              onChange={() => onAmenityToggle(category, item)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-[#CC6F4A]"
            />
            <span className="text-sm">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="home-glass-card rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">
          {t("propertyForm.step3.amenitiesTitle")}
        </h2>

        <div className="space-y-6">
          {renderAmenitySection("Home Safety", "homeSafety", homeSafetyOptions)}
          {renderAmenitySection("Bedroom", "bedroom", bedroomOptions)}
          {renderAmenitySection("Kitchen", "kitchen", kitchenOptions)}
          {renderAmenitySection("Others", "others", otherOptions)}
        </div>
      </div>
    </div>
  );
};

export default Step3Amenities;
