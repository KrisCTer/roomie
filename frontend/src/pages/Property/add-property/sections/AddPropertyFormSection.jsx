import React from "react";
import { Building } from "lucide-react";
import Step1Basic from "../../steps/Step1Basic.jsx";
import Step2Location from "../../steps/Step2Location.jsx";
import Step3Amenities from "../../steps/Step3Amenities.jsx";
import Step4Media from "../../steps/Step4Media.jsx";
import Step4Review from "../../steps/Step4Review.jsx";
import {
  homeSafetyOptions,
  bedroomOptions,
  kitchenOptions,
  otherOptions,
} from "../../../../services/vietnamData.js";

const AddPropertyFormSection = ({
  currentStep,
  propertyData,
  uploadedImages,
  uploadingImages,
  coverImage,
  isEditMode,
  propertyId,
  loading,
  provinces,
  districts,
  wards,
  mapsLoaded,
  error,
  setError,
  reviewImagePage,
  totalReviewImagePages,
  onInputChange,
  onLocationChange,
  onAddressResolved,
  onAmenityToggle,
  onImageUpload,
  onImageRemove,
  onCoverUpload,
  onCoverRemove,
  onPrevious,
  onNext,
  onSubmit,
  onPreviousReviewImagePage,
  onNextReviewImagePage,
  onToggle3dVisibility,
  onRefreshProperty,
}) => {
  return (
    <section>
      {currentStep === 1 && (
        <Step1Basic propertyData={propertyData} onInputChange={onInputChange} />
      )}

      {currentStep === 2 && (
        <Step2Location
          propertyData={propertyData}
          onInputChange={onInputChange}
          provinces={provinces}
          districts={districts}
          wards={wards}
          mapsLoaded={mapsLoaded}
          onLocationChange={onLocationChange}
          onAddressResolved={onAddressResolved}
          error={error}
          setError={setError}
        />
      )}

      {currentStep === 3 && (
        <Step3Amenities
          propertyData={propertyData}
          onAmenityToggle={onAmenityToggle}
          homeSafetyOptions={homeSafetyOptions}
          bedroomOptions={bedroomOptions}
          kitchenOptions={kitchenOptions}
          otherOptions={otherOptions}
        />
      )}

      {currentStep === 4 && (
        <Step4Media
          coverImage={coverImage}
          uploadedImages={uploadedImages}
          uploadingImages={uploadingImages}
          isEditMode={isEditMode}
          propertyId={propertyId}
          model3dStatus={propertyData.model3dStatus}
          model3dVisible={propertyData.model3dVisible}
          onCoverUpload={onCoverUpload}
          onCoverRemove={onCoverRemove}
          onImageUpload={onImageUpload}
          onImageRemove={onImageRemove}
          onToggle3dVisibility={onToggle3dVisibility}
          onRefreshProperty={onRefreshProperty}
        />
      )}

      {currentStep === 5 && (
        <>
          <Step4Review
            propertyData={propertyData}
            uploadedImages={uploadedImages.slice(
              (reviewImagePage - 1) * 8,
              reviewImagePage * 8,
            )}
            isEditMode={isEditMode}
          />

          {uploadedImages.length > 8 && (
            <div className="home-glass-soft mb-6 flex items-center justify-between rounded-2xl px-4 py-3">
              <p className="text-sm text-slate-600">
                Showing image page {reviewImagePage}/{totalReviewImagePages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPreviousReviewImagePage}
                  disabled={reviewImagePage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={onNextReviewImagePage}
                  disabled={reviewImagePage >= totalReviewImagePages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={currentStep === 1}
          className={`rounded-xl px-6 py-3 text-sm font-medium transition-colors md:text-base ${
            currentStep === 1
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Trước
        </button>

        {currentStep < 5 ? (
          <button
            onClick={onNext}
            className="home-btn-accent px-6 py-3 text-sm font-medium md:text-base"
          >
            Tiếp theo
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEditMode ? "Đang cập nhật..." : "Đang gửi..."}
              </>
            ) : (
              <>
                <Building className="h-5 w-5" />
                {isEditMode ? "Cập nhật bất động sản" : "Gửi bất động sản"}
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
};

export default AddPropertyFormSection;
