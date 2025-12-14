import React from "react";
import ImageUploader from "../../../components/Property/ImageUploader";

const Step3Amenities = ({
  propertyData,
  onAmenityToggle,
  uploadedImages,
  uploadingImages,
  onImageUpload,
  onImageRemove,
  homeSafetyOptions,
  bedroomOptions,
  kitchenOptions,
  otherOptions,
}) => {
  const renderAmenitySection = (title, category, options) => (
    <div>
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={propertyData[category].includes(item)}
              onChange={() => onAmenityToggle(category, item)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Amenities</h2>

        <div className="space-y-6">
          {renderAmenitySection("Home Safety", "homeSafety", homeSafetyOptions)}
          {renderAmenitySection("Bedroom", "bedroom", bedroomOptions)}
          {renderAmenitySection("Kitchen", "kitchen", kitchenOptions)}
          {renderAmenitySection("Others", "others", otherOptions)}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Property Media</h2>

        <ImageUploader
          uploadedImages={uploadedImages}
          uploadingImages={uploadingImages}
          onImageUpload={onImageUpload}
          onImageRemove={onImageRemove}
        />
      </div>
    </div>
  );
};

export default Step3Amenities;
