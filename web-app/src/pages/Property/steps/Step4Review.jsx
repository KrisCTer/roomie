import React from "react";
import { MapPin } from "lucide-react";
import InfoRow from "../../../components/Property/InfoRow";
import { useTranslation } from "react-i18next";
const Step4Review = ({ propertyData, uploadedImages, isEditMode }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">
        {t("propertyForm.step4.title")}
      </h2>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-3">
            {t("propertyForm.step4.sections.basic")}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Title" value={propertyData.title} />
            <InfoRow label="Type" value={propertyData.propertyType} />
            <InfoRow
              label="Monthly Rent"
              value={`${propertyData.monthlyRent || "0"}`}
            />
            <InfoRow label="Status" value={propertyData.propertyStatus} />
            <InfoRow label="Bedrooms" value={propertyData.bedrooms || "0"} />
            <InfoRow label="Bathrooms" value={propertyData.bathrooms || "0"} />
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-3">
            {t("propertyForm.step4.sections.location")}
          </h3>
          <p className="text-sm text-gray-700">
            {propertyData.fullAddress || "No address provided"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {propertyData.ward && `${propertyData.ward}, `}
            {propertyData.district && `${propertyData.district}, `}
            {propertyData.province}
          </p>
          {propertyData.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              Coordinates: {propertyData.location}
            </p>
          )}
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-3">
            {t("propertyForm.step4.sections.amenities")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              ...propertyData.homeSafety,
              ...propertyData.bedroom,
              ...propertyData.kitchen,
              ...propertyData.others,
            ].map((amenity, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
            {[
              ...propertyData.homeSafety,
              ...propertyData.bedroom,
              ...propertyData.kitchen,
              ...propertyData.others,
            ].length === 0 && (
              <span className="text-gray-500 text-sm">
                No amenities selected
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">
            {t("propertyForm.step4.sections.media")}
          </h3>
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {uploadedImages.slice(0, 8).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No images uploaded</p>
          )}
          {uploadedImages.length > 8 && (
            <p className="text-sm text-gray-600 mt-2">
              +{uploadedImages.length - 8} more images
            </p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Please review all information carefully
            before submitting.
            {isEditMode
              ? " Your changes will update the existing property."
              : " Once submitted, your property will be reviewed by our team."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step4Review;
